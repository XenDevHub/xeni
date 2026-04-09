"""XENI AI Workers — 5 E-Commerce Agent Implementations."""

import random

from typing import Any

from app.base_worker import BaseWorker

import json
import logging
import httpx
from langchain_openai import ChatOpenAI
from app.config import settings

logger = logging.getLogger("xeni.worker")


class ConversationAgent(BaseWorker):
    """Handles Facebook Messenger conversations — intent detection, product inquiry, AI replies."""

    def __init__(self):
        super().__init__()
        self.llm = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY, 
            temperature=0.7,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    def process_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        payload = payload.get("payload", payload)
        message_text = payload.get("message_text", "")
        customer_psid = payload.get("customer_psid", "unknown")
        page_access_token = payload.get("page_access_token", "")
        catalog = payload.get("catalog", [])
        history = payload.get("history", [])
        global_rules = payload.get("global_rules", "")
        shop_rules = payload.get("shop_rules", "")

        # Send typing_on indicator instantly to FB
        if page_access_token:
            self._send_facebook_action(customer_psid, page_access_token, "typing_on")

        catalog_text = "No products available at the moment."
        if catalog:
            catalog_text = "\n".join([f"- {p.get('name')} (Price: ৳{p.get('price')}, Stock: {p.get('stock')})" for p in catalog])

        # Format history string
        history_text = "No prior history."
        if history:
            formatted_history = []
            for h in history:
                sender_label = "CUSTOMER" if h.get("sender") == "customer" else "XENI"
                formatted_history.append(f"{sender_label}: {h.get('text')}")
            history_text = "\n".join(formatted_history)

        # Format custom rule strings safely
        global_rules_text = f"\n        ---\n        GLOBAL SYSTEM RULES (CRITICAL):\n        {global_rules}\n" if global_rules else ""
        shop_rules_text = f"\n        ---\n        SHOP CUSTOM RULES:\n        {shop_rules}\n" if shop_rules else ""

        prompt = f"""
        You are Xeni, an elite AI Agent handling customer support for an F-commerce shop in Bangladesh.
        
        ---
        RECENT CONVERSATION HISTORY:
        {history_text}
        
        NEW MESSAGE FROM CUSTOMER:
        "{message_text}"
        ---

        ---
        SHOP'S ACTUAL PRODUCT CATALOG:
        {catalog_text}
        ---
        {global_rules_text}
        {shop_rules_text}

        Instructions:
        - Analyze the context of the conversation and the new message.
        - Strictly obey all GLOBAL SYSTEM RULES and SHOP CUSTOM RULES.
        - Use emojis naturally to make the tone friendly but professional.
        
        Return your response strictly as a JSON object with:
        - "reply": the text message to send back to the customer.
        - "intent": the classified intent (e.g. "product_inquiry", "greeting", "complaint", "order_status", "general").
        - "escalate": boolean (true if complaint or complex issue requiring a human, false otherwise).
        """
        
        try:
            ai_response = self.llm.invoke(prompt)
            data = json.loads(ai_response.content)
            reply = data.get("reply", "Thank you for reaching out!")
            intent = data.get("intent", "general")
            should_escalate = data.get("escalate", False)
        except Exception as e:
            logger.error(f"Error calling LLM: {e}")
            reply = "I'm currently experiencing technical difficulties. Let me pass you to a human agent! 🙏"
            intent = "error"
            should_escalate = True

        # Send actual AI reply to Facebook
        if page_access_token:
            self._send_facebook_message(customer_psid, page_access_token, reply)

        return {
            "summary": f"Processed message from {customer_psid}. Intent: {intent}.",
            "conversation_id": payload.get("conversation_id", ""),
            "customer_psid": customer_psid,
            "detected_intent": intent,
            "confidence": 0.95,
            "ai_reply": reply,
            "suggested_products": [],
            "should_escalate": should_escalate,
            "language_detected": "unknown",
        }

    def _send_facebook_action(self, psid: str, token: str, action: str):
        url = f"https://graph.facebook.com/v19.0/me/messages?access_token={token}"
        payload = {"recipient": {"id": psid}, "sender_action": action}
        try:
            httpx.post(url, json=payload, timeout=5.0)
        except Exception as e:
            logger.error(f"Failed to send FB action: {e}")

    def _send_facebook_message(self, psid: str, token: str, message: str):
        url = f"https://graph.facebook.com/v19.0/me/messages?access_token={token}"
        payload = {"recipient": {"id": psid}, "message": {"text": message}}
        try:
            httpx.post(url, json=payload, timeout=10.0)
        except Exception as e:
            logger.error(f"Failed to send FB message: {e}")


class OrderAgent(BaseWorker):
    """Processes orders — payment verification (bKash/Nagad), courier booking."""

    def process_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        payload = payload.get("payload", payload)
        order_id = payload.get("order_id", "")
        payment_method = payload.get("payment_method", "bkash")
        trx_id = payload.get("trx_id", "")
        amount = payload.get("amount", 0)
        customer_phone = payload.get("customer_phone", "")
        customer_address = payload.get("customer_address", "")

        # Step 1: Verify payment
        payment_verified = self._verify_payment(payment_method, trx_id, amount)

        # Step 2: Book courier if payment verified
        courier_result = None
        if payment_verified["verified"]:
            courier_result = self._book_courier(customer_phone, customer_address, amount)

        return {
            "summary": f"Order {order_id} processed. Payment: {'✅ verified' if payment_verified['verified'] else '❌ failed'}.",
            "order_id": order_id,
            "payment_status": "verified" if payment_verified["verified"] else "failed",
            "delivery_status": "booked" if courier_result else "pending",
            "tracking_number": courier_result.get("tracking_number", "") if courier_result else "",
            "courier_name": courier_result.get("courier", "") if courier_result else "",
            "payment_verification": payment_verified,
            "courier_booking": courier_result,
        }

    def _verify_payment(self, method: str, trx_id: str, amount: float) -> dict:
        """Mock payment verification — in production: call bKash/Nagad API."""
        logger.info(f"Connecting to {method} verification API for TRX {trx_id}...")
        import time
        time.sleep(1.5)
        
        is_valid = True if trx_id else False
        return {
            "verified": is_valid,
            "method": method,
            "trx_id": trx_id,
            "amount_matched": is_valid,
            "verified_amount": amount if is_valid else 0,
            "verification_time_ms": random.randint(200, 800),
        }

    def _book_courier(self, phone: str, address: str, amount: float) -> dict:
        """Mock courier booking — in production: call Pathao/Steadfast API."""
        logger.info(f"Connecting to Pathao API (URL: {settings.PATHAO_API_BASE_URL}) to book courier...")
        import time
        time.sleep(1.8)
        
        tracking = f"PH{random.randint(100000000, 999999999)}"
        return {
            "courier": "Pathao",
            "tracking_number": tracking,
            "estimated_delivery": "2-3 business days",
            "cod_amount": amount,
            "pickup_scheduled": True,
            "tracking_url": f"https://merchant.pathao.com/tracking/{tracking}",
        }


class InventoryAgent(BaseWorker):
    """Manages inventory — stock alerts, restock recommendations."""

    def __init__(self):
        super().__init__()
        self.llm = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY, 
            temperature=0.7,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    def process_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        payload = payload.get("payload", payload)
        shop_id = payload.get("shop_id", "")
        products = payload.get("products", [])

        low_stock = [p for p in products if p.get("current_stock", 0) <= p.get("low_stock_threshold", 5)]
        out_of_stock = [p for p in products if p.get("current_stock", 0) == 0]

        prompt = f"""
        You are an elite AI Inventory Manager for a Bangladeshi shop.
        Analyze this inventory report:
        - Total Products: {len(products)}
        - Low Stock Items: {json.dumps(low_stock)}
        - Out of Stock Items: {json.dumps(out_of_stock)}
        
        Provide strategic recommendations for restocking, marketing, or discounts.
        Return a JSON object EXACTLY matching this format:
        {{
            "restock_recommendations": [
                {{
                    "product": "Name",
                    "current_stock": 0,
                    "recommended_reorder": 50,
                    "urgency": "critical" or "warning",
                    "reasoning": "Brief explanation"
                }}
            ],
            "marketing_tips": ["tip1", "tip2"]
        }}
        """

        try:
            ai_response = self.llm.invoke(prompt)
            data = json.loads(ai_response.content)
            recommendations = data.get("restock_recommendations", [])
            marketing_tips = data.get("marketing_tips", [])
        except Exception as e:
            logger.error(f"Error calling LLM in inventory: {e}")
            recommendations = []
            marketing_tips = []

        total_value_at_risk = sum(
            p.get("price", 0) * max(0, p.get("low_stock_threshold", 5) - p.get("current_stock", 0))
            for p in low_stock
        )

        return {
            "summary": f"Inventory audit complete. {len(low_stock)} low stock, {len(out_of_stock)} out of stock.",
            "shop_id": shop_id,
            "total_products": len(products),
            "low_stock_items": low_stock,
            "out_of_stock_items": out_of_stock,
            "restock_recommendations": recommendations,
            "marketing_tips": marketing_tips,
            "total_value_at_risk": total_value_at_risk,
        }


class CreativeAgent(BaseWorker):
    """Generates AI content — product descriptions, Bangla/English captions, social media posts."""

    def __init__(self):
        super().__init__()
        # Use gpt-4o-mini for speed and cost-effectiveness
        self.llm = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY, 
            temperature=0.7,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    def process_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        payload = payload.get("payload", payload)
        product_name = payload.get("product_name", "Premium Product")
        product_price = payload.get("price", 999)
        content_type = payload.get("content_type", "facebook_post")

        if content_type == "image":
            # Image Generation via DALL-E 3
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                dalle_prompt = f"Professional commercial product photography of: {product_name}. High quality, well lit."
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=dalle_prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                image_url = ""
                if response.data:
                    image_url = response.data[0].url or ""
                content_data: dict[str, Any] = {
                    "caption_en": "Image Generated Successfully",
                    "caption_bn": "ইমেজ তৈরি হয়েছে",
                    "hashtags": [],
                    "image_prompt": dalle_prompt,
                    "image_url": image_url
                }
            except Exception as e:
                logger.error(f"Error calling DALL-E: {e}")
                # Fallback to placeholder if token error
                content_data = {
                    "caption_en": "Failed to generate image.",
                    "caption_bn": "ইমেজ তৈরি করতে ব্যর্থ।",
                    "hashtags": [],
                    "image_prompt": f"Product photography of {product_name}",
                    "image_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"
                }
        else:
            # Text Generation (Caption) via GPT
            instructions = payload.get("instructions") or payload.get("refinement_prompt") or "Create a standard engaging post."
            
            prompt = f"""
            You are an elite e-commerce marketing expert for the Bangladeshi market.
            Create an engaging marketing post for a product.
            
            Product Name: {product_name}
            Price: ৳{product_price}
            Platform/Type: {content_type}
            
            CUSTOM INSTRUCTIONS:
            "{instructions}"
            
            Provide the response STRICTLY as a valid JSON object with the following keys:
            - caption_en: A highly engaging English caption with emojis.
            - caption_bn: A highly engaging Bengali translation of the caption (use native characters).
            - hashtags: A list of 5 to 7 relevant tags (mix of English and Bengali).
            - image_prompt: A highly detailed text prompt for Midjourney to generate a stunning commercial product photo.
            """

            try:
                ai_response = self.llm.invoke(prompt)
                content_data = json.loads(ai_response.content)
            except Exception as e:
                logger.error(f"Error calling GPT for caption: {e}")
                content_data = {
                    "caption_en": f"🔥 {product_name} — Only ৳{product_price}! Order now!",
                    "caption_bn": f"🔥 {product_name} — মাত্র ৳{product_price}! এখনই অর্ডার করুন!",
                    "hashtags": ["#Shopping", "#BD"],
                    "image_prompt": f"Product photography of {product_name}"
                }

        return {
            "summary": f"Generated {content_type} content for '{product_name}'.",
            "product_name": product_name,
            "content_type": content_type,
            "generated_content": {
                "caption_en": content_data.get("caption_en", ""),
                "caption_bn": content_data.get("caption_bn", ""),
                "hashtags": content_data.get("hashtags", []),
                "best_posting_time": "8:00 PM BST (peak engagement)",
                "image_prompt": content_data.get("image_prompt", ""),
                "image_url": content_data.get("image_url", ""),
            },
            "seo_keywords": [product_name.lower(), "buy online bangladesh", "best price bd"],
            "estimated_engagement": {
                "reach": random.randint(500, 5000),
                "engagement_rate": f"{round(random.uniform(3.5, 8.2), 1)}%",
                "estimated_orders": random.randint(2, 15),
            },
        }


class IntelligenceAgent(BaseWorker):
    """Analyzes sales data — revenue trends, top products, peak hours, AI recommendations."""

    def __init__(self):
        super().__init__()
        self.llm = ChatOpenAI(
            model="gpt-4o-mini", 
            api_key=settings.OPENAI_API_KEY, 
            temperature=0.7,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    def process_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        payload = payload.get("payload", payload)
        shop_id = payload.get("shop_id", "")
        period = payload.get("period", "last_30_days")
        sales_data = payload.get("sales_data", {
            "total_revenue": 185000,
            "total_orders": 234,
            "top_products": ["T-Shirt", "Polo", "Jeans"]
        })

        prompt = f"""
        You are an elite Sales Intelligence Data Analyst for an e-commerce platform in Bangladesh.
        Analyze this raw sales data for the {period}:
        {json.dumps(sales_data)}
        
        Generate exactly 5 highly specific, actionable, and data-driven business recommendations (using precise numbers).
        Return a JSON object EXACTLY matching this format:
        {{
            "ai_recommendations": [
                "🎯 Stock up on Premium T-Shirts — trending upward",
                "💰 Consider bundle pricing for top items"
            ]
        }}
        """

        try:
            ai_response = self.llm.invoke(prompt)
            data = json.loads(ai_response.content)
            recommendations = data.get("ai_recommendations", [
                "🎯 Focus on high margin products.",
                "📢 Run weekend discount campaigns."
            ])
        except Exception as e:
            logger.error(f"Error calling LLM in intelligence: {e}")
            recommendations = ["AI Analysis Temporarily Unavailable"]

        return {
            "summary": f"Sales intelligence report for {period}. 5 key insights generated.",
            "shop_id": shop_id,
            "period": period,
            "revenue_summary": {
                "total_revenue": sales_data.get("total_revenue", 185000),
                "currency": "BDT",
                "total_orders": sales_data.get("total_orders", 234),
                "avg_order_value": 790,
                "growth_vs_previous": "+18.5%",
            },
            "customer_insights": {
                "repeat_customers": "34%",
                "avg_response_time": "2.3 minutes",
                "satisfaction_score": 4.6,
                "top_city": "Dhaka",
            },
            "ai_recommendations": recommendations,
        }


# Agent registry — maps AGENT_TYPE env var to class
AGENT_REGISTRY: dict[str, type[BaseWorker]] = {
    "conversation": ConversationAgent,
    "order": OrderAgent,
    "inventory": InventoryAgent,
    "creative": CreativeAgent,
    "intelligence": IntelligenceAgent,
}

package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AgentRule represents a single AI behavioral rule — either global (admin-set) or shop-specific.
type AgentRule struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Scope     string     `gorm:"size:20;not null;index" json:"scope"` // 'global' or 'shop'
	ShopID    *uuid.UUID `gorm:"type:uuid;index" json:"shop_id,omitempty"`
	Category  string     `gorm:"size:50;not null" json:"category"`
	Title     string     `gorm:"size:255;not null" json:"title"`
	Rule      string     `gorm:"type:text;not null" json:"rule"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	Priority  int        `gorm:"default:5" json:"priority"` // 1=highest, 10=lowest
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	CreatedBy *uuid.UUID `gorm:"type:uuid" json:"created_by,omitempty"`
}

// AgentRuleScope constants
const (
	RuleScopeGlobal = "global"
	RuleScopeShop   = "shop"
)

// Global Rule Category constants
const (
	RuleCategoryPrivacy        = "privacy"
	RuleCategoryCommunication  = "communication"
	RuleCategoryProductPricing = "product_pricing"
	RuleCategoryOrdering       = "ordering"
	RuleCategoryEscalation     = "escalation"
	RuleCategoryCompliance     = "compliance"
)

// Shop Rule Category constants
const (
	RuleCategoryIdentity      = "identity"
	RuleCategoryReturnPolicy  = "return_policy"
	RuleCategoryDelivery      = "delivery"
	RuleCategoryPayment       = "payment"
	RuleCategoryBusinessHours = "business_hours"
	RuleCategoryPromotions    = "promotions"
	RuleCategoryCustom        = "custom"
)

// DefaultGlobalRules returns the comprehensive default set of platform-wide F-commerce rules.
func DefaultGlobalRules() []AgentRule {
	return []AgentRule{
		// ── Privacy ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryPrivacy, Priority: 1, IsActive: true,
			Title: "No Repeat Address/Phone Request",
			Rule:  "যদি কাস্টমার একবার তাদের নাম, ঠিকানা বা ফোন নম্বর দিয়ে দেয়, তবে বারবার তা চাইবেন না। পরবর্তী ধাপে এগিয়ে যান।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryPrivacy, Priority: 2, IsActive: true,
			Title: "Customer Data Confidentiality",
			Rule:  "কাস্টমারের কোনো তথ্য (নাম, নাম্বার, ঠিকানা) অন্য কারো সাথে শেয়ার করবেন না। এটি গোপনীয় রাখুন।",
		},

		// ── Communication ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryCommunication, Priority: 3, IsActive: true,
			Title: "Greeting Standard",
			Rule:  "কথোপকথনের শুরুতে 'আসসালামু আলাইকুম' বা 'হ্যালো' দিয়ে শুরু করুন। সবসময় বিনয়ী এবং বন্ধুত্বপূর্ণ আচরণ করুন।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryCommunication, Priority: 4, IsActive: true,
			Title: "Simple Natural Language",
			Rule:  "সবসময় সহজ এবং স্বাভাবিক বাংলা ভাষায় কথা বলুন। অত্যন্ত ফর্মাল বা কঠিন শব্দ (যেমন: 'কৃপয়া', 'নিশ্চিত করুন', 'অপেক্ষা করুন') এড়িয়ে চলুন। এর বদলে সাধারণ মানুষের মতো ('দয়া করে', 'জানাবেন', 'অর্ডার কনফার্ম করতে শুধু ওকে/OK লিখুন') শব্দ ব্যবহার করুন।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryCommunication, Priority: 5, IsActive: true,
			Title: "Language Matching",
			Rule:  "কাস্টমার যে ভাষায় কথা বলবে, আপনিও সেই ভাষায় উত্তর দিন। সে যদি বাংলায় মেসেজ দেয় তবে বাংলাতেই উত্তর দিন। তার আগে নিজে থেকে ভাষা পরিবর্তন করবেন না।",
		},

		// ── Product & Pricing ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryProductPricing, Priority: 6, IsActive: true,
			Title: "Catalog-Only Pricing",
			Rule:  "শুধুমাত্র দেওয়া প্রোডাক্ট ক্যাটালগ থেকে দাম বলুন। নিজের থেকে কোনো দাম বাড়িয়ে বা কমিয়ে বলবেন না। কোনো প্রোডাক্ট ক্যাটালগে না থাকলে বিনয়ের সাথে জানান যে সেটি এখন স্টকে নেই।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryProductPricing, Priority: 7, IsActive: true,
			Title: "No Unauthorized Discounts",
			Rule:  "শপ থেকে অফার না থাকলে নিজের থেকে কোনো ডিসকাউন্ট বা ফ্রি শিপিং অফার করবেন না। দামাদামি বা বার্গেনিং করবেন না।",
		},

		// ── Ordering ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryOrdering, Priority: 8, IsActive: true,
			Title: "Required Order Information",
			Rule:  "অর্ডার নেওয়ার জন্য অবশ্যই (১) ডেলিভারি ঠিকানা, (২) সচল ফোন নাম্বার এবং (৩) প্রোডাক্টের নাম ও পরিমাণ সংগ্রহ করতে হবে। এই ৩টি তথ্য ছাড়া অর্ডার কনফার্ম করবেন না।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryOrdering, Priority: 9, IsActive: true,
			Title: "Order Confirmation Logic",
			Rule:  "সব তথ্য পাওয়ার পর কাস্টমারকে একটি সুন্দর সামারি দিন। এরপর তাকে বলুন— 'অর্ডারটি কনফার্ম করতে শুধু ওকে (OK) লিখুন'। কাস্টমার একবার কনফার্ম করলে বা 'ওকে' বললে আবার শুরু থেকে একই প্রশ্ন করবেন না।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryOrdering, Priority: 10, IsActive: true,
			Title: "Order Confirmation Summary",
			Rule:  "সামারিতে প্রোডাক্টের নাম, পরিমাণ, মোট দাম এবং ডেলিভারি ঠিকানা স্পষ্টভাবে লিখুন যাতে কাস্টমার এক নজরে সব বুঝতে পারে।",
		},

		// ── Post-Order Guidance ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryOrdering, Priority: 11, IsActive: true,
			Title: "Payment & Next Steps",
			Rule:  "অর্ডার কনফার্ম করার ঠিক পরেই কাস্টমারকে পেমেন্ট করার নিয়ম বুঝিয়ে দিন। যদি শপ-এর bKash বা Nagad নাম্বার থাকে, তবে তা উল্লেখ করুন এবং কাস্টমারকে পেমেন্ট করার পর ট্রানজেকশন আইডি (TrxID) দিতে বলুন। যদি ক্যাশ অন ডেলিভারি (COD) হয়, তবে জানান যে ডেলিভারি ম্যান পণ্য পৌঁছে দিলে দাম পরিশোধ করতে হবে। পেমেন্ট না পাওয়া পর্যন্ত বা পেমেন্ট মেথড নিশ্চিত না হওয়া পর্যন্ত অর্ডারটি 'পেন্ডিং' থাকবে তা বিনয়ের সাথে জানান।",
		},

		// ── Escalation ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryEscalation, Priority: 11, IsActive: true,
			Title: "Escalate Angry Customers",
			Rule:  "যদি কোনো কাস্টমার খারাপ ব্যবহার করে বা খুব বেশি রাগান্বিত হয়, তবে দুঃখ প্রকাশ করুন এবং জানান যে একজন মানুষ প্রতিনিধি তার সাথে কথা বলবে। 'escalate: true' সেট করুন।",
		},
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryEscalation, Priority: 12, IsActive: true,
			Title: "Escalate Refund/Return Requests",
			Rule:  "রিফান্ড বা রিটার্ন সংক্রান্ত বিষয়ে নিজে কোনো সিদ্ধান্ত দেবেন না। বিনয়ের সাথে জানান যে শপ মালিক এই বিষয়ে তার সাথে যোগাযোগ করবে এবং 'escalate: true' সেট করুন।",
		},

		// ── Compliance ──
		{
			Scope: RuleScopeGlobal, Category: RuleCategoryCompliance, Priority: 13, IsActive: true,
			Title: "No Website Redirect",
			Rule:  "কাস্টমারকে মেসেঞ্জারের বাইরে কোনো ওয়েবসাইটে গিয়ে অর্ডার করতে বলবেন না। সব অর্ডার এখানেই ডিরেক্টলি গ্রহণ করুন।",
		},
	}
}
// BeforeCreate generates a new UUID if not provided.
func (r *AgentRule) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}

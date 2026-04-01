package storage

import (
	"context"
	"fmt"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	xconf "github.com/xeni-ai/gateway/internal/config"
)

type SpacesClient struct {
	S3Client *s3.Client
	Config   xconf.SpacesConfig
}

func ConnectSpaces(cfg xconf.SpacesConfig) (*SpacesClient, error) {
	if cfg.Key == "" || cfg.Secret == "" || cfg.Bucket == "" || cfg.Endpoint == "" {
		return nil, fmt.Errorf("missing DO Spaces credentials")
	}

	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:           cfg.Endpoint,
			SigningRegion: cfg.Region,
		}, nil
	})

	awscfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(customResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.Key, cfg.Secret, "")),
		config.WithRegion(cfg.Region),
	)
	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(awscfg, func(o *s3.Options) {
		o.UsePathStyle = false
	})

	return &SpacesClient{
		S3Client: client,
		Config:   cfg,
	}, nil
}

func (s *SpacesClient) UploadFile(ctx context.Context, file *multipart.FileHeader, path string) (string, error) {
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	_, err = s.S3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.Config.Bucket),
		Key:         aws.String(path),
		Body:        src,
		ACL:         types.ObjectCannedACLPublicRead,
		ContentType: aws.String(file.Header.Get("Content-Type")),
	})

	if err != nil {
		return "", err
	}

	// Generate public URL
	if s.Config.CDNBase != "" {
		return fmt.Sprintf("%s/%s", s.Config.CDNBase, path), nil
	}
	return fmt.Sprintf("%s/%s/%s", s.Config.Endpoint, s.Config.Bucket, path), nil
}

with open('template-production.yaml', 'r') as f:
    content = f.read()

# Replace the Secrets Manager reference with the parameter reference
old_jwt = "JWT_SECRET: !Sub '{{resolve:secretsmanager:taxflowai/jwt-secret:SecretString:secret}}'"
new_jwt = "JWT_SECRET: !Ref JwtSecret"

if old_jwt in content:
    content = content.replace(old_jwt, new_jwt)
    with open('template-production.yaml', 'w') as f:
        f.write(content)
    print("✅ Fixed JWT_SECRET reference")
else:
    print("⚠️ JWT_SECRET reference not found or already fixed")

# Quick Start - Environment Variables

## 🚀 Getting Started in 3 Steps

### 1. Copy the example file
```bash
cp .env.example .env
```

### 2. Edit these CRITICAL settings for production:

```bash
# MUST CHANGE FOR PRODUCTION
NODE_ENV=production
JWT_SECRET=<run command below to generate>

# Generate a secure JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Start the application
```bash
npm start
```

## 🔥 Most Important Variables

| Variable | Default | Production Value | Why Change? |
|----------|---------|------------------|-------------|
| `JWT_SECRET` | `your-secret-key-change-in-production` | Random 64-char hex | **CRITICAL** - Security |
| `NODE_ENV` | `development` | `production` | Performance & security |
| `PORT` | `80` | `80` or `443` | May need sudo for <1024 |
| `CORS_ORIGIN` | `*` | `https://yourdomain.com` | Security in production |
| `MAX_FILE_SIZE` | `52428800` (50MB) | Adjust as needed | Storage/bandwidth |

## 📝 Common Configurations

### Local Development (Default)
Just use the defaults! No `.env` needed.

### Production Server
```bash
NODE_ENV=production
PORT=80
JWT_SECRET=<your-generated-secret>
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=10485760
```

### Local Network (Home/Office)
```bash
PORT=3000
SERVICE_NAME=Team Chat
MDNS_HOSTNAME=team-chat.local
MAX_FILE_SIZE=104857600
```

### High Security
```bash
NODE_ENV=production
JWT_SECRET=<strong-secret>
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=14
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=5242880
```

## 🛟 Quick Troubleshooting

### "Port already in use"
```bash
# Change port in .env
PORT=3000
```

### "Invalid token" errors
```bash
# JWT_SECRET may have changed - users need to re-login
# Or token expired - check JWT_EXPIRES_IN
```

### Can't upload files
```bash
# Check max file size
MAX_FILE_SIZE=104857600  # 100MB
```

### Can't access from other devices
```bash
# Ensure host is correct
HOST=0.0.0.0
# Check firewall for your PORT
```

## 📚 Full Documentation

- **Complete guide**: See `ENV_CONFIG.md`
- **Migration info**: See `ENVIRONMENT_SETUP.md`
- **General docs**: See `README.md`

## 🔐 Security Checklist for Production

- [ ] Changed `JWT_SECRET` to a secure random value
- [ ] Set `NODE_ENV=production`
- [ ] Configured `CORS_ORIGIN` to specific domain(s)
- [ ] Set appropriate `JWT_EXPIRES_IN` (recommended: 1h-24h)
- [ ] Increased `BCRYPT_ROUNDS` to 12 or higher
- [ ] Set appropriate `MAX_FILE_SIZE` for your needs
- [ ] Configured firewall rules for your `PORT`
- [ ] Set up regular database backups
- [ ] Secured the `uploads/` directory

## 💡 Pro Tips

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use different secrets per environment** - Dev, staging, production
3. **Rotate secrets regularly** - Especially JWT_SECRET
4. **Monitor file uploads** - Set `MAX_FILE_SIZE` appropriately
5. **Enable rate limiting in production** - Prevents abuse
6. **Use HTTPS in production** - Consider reverse proxy (nginx)

---

**Need more details?** Check `ENV_CONFIG.md` for comprehensive documentation!

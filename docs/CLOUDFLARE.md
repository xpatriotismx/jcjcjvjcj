# Cloudflare Ayarları

1. Alan adının DNS kaydını Railway veya Render'ın verdiği hedefe yönlendirin.
2. Proxy durumunu turuncu bulut olarak açık tutun.
3. SSL/TLS modunu `Full (strict)` seçin.
4. Network bölümünde WebSockets desteğini açık tutun.
5. `/ws*` için Cache Rule oluşturup cache'i devre dışı bırakın.
6. `/api*` için de dinamik içerik cache'ini kapatın.
7. Statik Vite asset'leri için uzun süreli cache kullanın.

Fastify sunucusu `trustProxy`, 72 saniyelik keep-alive ve 25 saniyelik WebSocket ping döngüsüyle Cloudflare proxy bağlantılarına hazırdır. İstemci, kopan bağlantıyı artan gecikmeyle otomatik yeniden kurar ve oda geçmişini PostgreSQL'den geri alır.

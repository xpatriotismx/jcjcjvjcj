# Eski PHP Verisini Taşıma

Bu sürüm temiz PostgreSQL şemasıyla gelir. Eski `database.sql` doğrudan içe aktarılmamalıdır; MySQL enum, bozuk karakter kodlaması, tekrar eden tablolar ve düz metin parola kalıntıları içerir.

Önerilen geçiş sırası:

1. Eski veritabanını salt okunur yedekleyin.
2. `users` kayıtlarını `User` modeline taşıyın.
3. Parola yalnızca PHP `password_hash` biçimindeyse kullanıcıyı parola sıfırlamaya yönlendirin. Düz metin parolaları taşımayın.
4. `para` alanını `money`, `gold` alanını `gold`, `vip_bitis` epoch değerini `vipExpiresAt` olarak dönüştürün.
5. `siginak_kayitlari` kayıtlarını `Shelter` modeline dönüştürün.
6. `chat_messages` ve `sohbet_mesajlar` tablolarını temizleyip tek `ChatMessage` tablosuna birleştirin.
7. Aktif klan savaşlarını `Battle`, saldırı günlüklerini `BattleEvent` olarak dönüştürün.
8. Test ortamında toplam kullanıcı, bakiye, VIP ve aktif sığınak sayılarını iki sistem arasında karşılaştırın.

Eski PHP dosyaları yeni deploy paketine alınmamıştır. Bu, yapılandırma parolalarının ve eski güvenlik açıklarının üretime yeniden taşınmasını önler.

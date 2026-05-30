# Nhật ký kỹ thuật: Thay đổi Hệ thống Phông chữ (Typography Redesign)
*Ngày thực hiện: 30/05/2026*

## 1. Bối Cảnh & Vấn Đề
* Khi thuyết trình bằng Tiếng Việt, phông chữ `--font-heading: 'Syne'` gốc của slide không hỗ trợ đầy đủ bộ ký tự Latin có dấu của tiếng Việt. Điều này dẫn đến hiện tượng lỗi hiển thị (fallback) nghiêm trọng khi hệ thống tự động đưa các ký tự có dấu về phông mặc định (Arial/Times New Roman).
* Cần tìm giải pháp phông chữ đồng bộ mới, vừa mang đậm cá tính công nghệ (phù hợp với chủ đề giới thiệu ngành CNTT của Đại học Công nghệ Thông tin - UIT), vừa hỗ trợ tiếng Việt hoàn hảo 100%.

## 2. Quyết Định Thiết Kế & Giải Pháp
Sau phiên thảo luận và nhận được sự phê duyệt từ người dùng, toàn bộ hệ thống Typography của slide đã được thay thế như sau:
* **Tiêu đề lớn (Heading):** Sử dụng **`Bricolage Grotesque`** thay thế cho `Syne`. Font chữ này có các đường cong bo góc co giãn cực kỳ ngẫu hứng, nghệ thuật và mang tính đột phá cao (phong cách Quirky Grotesque), hỗ trợ 100% tiếng Việt không lỗi dấu.
* **Tiêu đề phụ & Số liệu (Subheading):** Giữ nguyên **`Space Grotesk`** để duy trì nét kỹ thuật, cơ học của dân CNTT.
* **Nội dung chi tiết (Body):** Sử dụng **`Be Vietnam Pro`** (font chữ cực sạch được tối ưu hóa riêng cho tiếng Việt bởi tác giả người Việt) thay cho `Plus Jakarta Sans`.

## 3. Các File Đã Thay Đổi
* **[css/style.css](file:///Users/tunganh252/Desktop/Study/UIT_UNIVERSITY/HK1-03-2026/gioi_thieu_nganh_cntt/bai_cuoi_ky/uit-content-slides-presentation-industry-introduce/css/style.css):**
  * Thay đổi dòng `@import` ở đầu file để tải các phông chữ mới từ Google Fonts.
  * Cập nhật các biến CSS toàn cục `--font-heading` và `--font-body` trong bộ chọn `:root`.

## 4. Đánh Giá Kết Quả
* **Độ ổn định:** Toàn bộ tiêu đề và nội dung trên tất cả các slide (đặc biệt là các slide tiếng Việt phức tạp) hiện đã hiển thị mượt mà, đồng bộ và không còn bất kỳ lỗi dấu hoặc nhảy font nào.
* **Hiệu ứng thị giác:** Sự tương phản giữa phông chữ tiêu đề dày dặn, nghệ thuật (`Bricolage Grotesque`) và phông chữ nội dung tối giản, rõ nét (`Be Vietnam Pro`) mang lại cảm giác cực kỳ cao cấp, phá cách đúng tinh thần Neo-Brutalism.

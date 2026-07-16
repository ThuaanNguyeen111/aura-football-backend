import { hashPassword } from './utils/crypto'
import databaseService from './services/database.services'
// Nếu dự án của bạn có định nghĩa sẵn Enum cho Role và Verify Status, hãy import ở đây.
// Nếu không thì cứ điền số/chuỗi trực tiếp như đoạn code phía dưới nhé.

export async function seedAdminAccount() {
  try {
    // 1. Cấu hình thông tin tài khoản Admin mặc định
    const ADMIN_EMAIL = 'admin.aura@fpt.edu.vn'
    const ADMIN_PASSWORD = 'AuraAdmin@2026!'

    // 2. Kiểm tra tài khoản Admin trong Collection 'users'
    const existingAdmin = await databaseService.users.findOne({ email: ADMIN_EMAIL })

    if (existingAdmin) {
      console.log('📢 [Seed Data]: Tài khoản Admin mặc định đã tồn tại. Bỏ qua bước tạo mới.')
      return
    }

    // 3. Tiến hành băm mật khẩu bằng SHA256 thông qua hàm tiện ích của bạn
    const hashedPassword = hashPassword(ADMIN_PASSWORD)

    // 4. Bổ sung đầy đủ các thuộc tính bắt buộc của Type 'User' để fix triệt để lỗi ts(2345)
    const defaultAdmin = {
      name: 'Maison De Thuận Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      phone_number: '+525612627398',

      // Khớp với trường 'role' (Thay vì 'user_role' cũ)
      role: 1, // 1 đại diện cho quyền Admin tối cao

      // Khớp với trường 'verify'
      verify: 1, // 1 đại diện cho trạng thái Đã xác thực (Verified)

      // Các thuộc tính bắt buộc còn thiếu mà TypeScript báo lỗi:
      wallet_balance: 0, // Số dư ví nội bộ ban đầu của Admin
      has_booked_before: false, // Mặc định tài khoản mới tạo chưa từng đặt sân
      email_verify_token: '', // Chuỗi rỗng vì tài khoản seed không cần verify lại qua mail
      forgot_password_token: '', // Chuỗi rỗng

      created_at: new Date(),
      updated_at: new Date()
    }

    // 5. Insert trực tiếp vào MongoDB thông qua databaseService
    // Thêm từ khóa 'as any' nếu cấu hình Type của bạn có thêm các trường mở rộng phức tạp khác
    await databaseService.users.insertOne(defaultAdmin as any)

    console.log('========================================================')
    console.log('🚀 [SEED DATA SUCCESS]: ĐÃ KHỞI TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!')
    console.log(`👉 Email: ${ADMIN_EMAIL}`)
    console.log(`👉 Password: ${ADMIN_PASSWORD}`)
    console.log('========================================================')
  } catch (error) {
    console.error('❌ Lỗi nghiêm trọng khi khởi tạo tài khoản Admin:', error)
  }
}

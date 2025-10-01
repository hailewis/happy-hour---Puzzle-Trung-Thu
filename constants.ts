import { GameConfig } from './types';

export const APP_BACKGROUND_IMAGES = [
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/trung_thu_nam_2025_vao_ngay_nao_1_f8074057fa.jpg',
  'https://hoangthanhthanglong.vn/wp-content/uploads/2023/05/linhlichtrangram.jpeg',
  'https://booking.muongthanh.com/upload_images/images/H%60/nguon-goc-tet-trung-thu.jpg',
];

export const PUZZLE_BACKGROUND_IMAGES = [
  'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/trung_thu_nam_2025_vao_ngay_nao_1_f8074057fa.jpg',
  'https://bongbachtuyet.com.vn/wp-content/uploads/2023/09/040219-01-Lich-Ngay-Trung-Thu.jpg',
  'https://hoangthanhthanglong.vn/wp-content/uploads/2023/05/linhlichtrangram.jpeg',
  'https://booking.muongthanh.com/upload_images/images/H%60/nguon-goc-tet-trung-thu.jpg',
];

export const DEFAULT_GAME_CONFIGS: GameConfig[] = [
  {
    id: 'default-puzzle-1',
    targetImage: PUZZLE_BACKGROUND_IMAGES[0],
    targetTheme: "Đây là một vật dụng quen thuộc trong Tết Trung Thu.",
    targetName: "Đèn lồng Trung Thu",
    targetMeaning: "Những chiếc đèn lồng tượng trưng cho sự ấm áp, sum vầy và ánh sáng dẫn đường cho những điều may mắn, tốt đẹp trong cuộc sống.",
    questions: [
      { id: 0, q: "Tết Trung Thu còn có tên gọi khác là gì?", a: ["TẾT TRÔNG TRĂNG", "TET TRONG TRANG"] },
      { id: 1, q: "Loại bánh đặc trưng không thể thiếu trong dịp Tết Trung Thu là gì?", a: ["BÁNH TRUNG THU", "BANH TRUNG THU"] },
      { id: 2, q: "Con vật nào được gắn liền với sự tích chú Cuội trên cung trăng?", a: ["THỎ NGỌC", "THO NGOC"] },
      { id: 3, q: "Hoạt động nào thường được trẻ em yêu thích nhất vào đêm Trung Thu?", a: ["RƯỚC ĐÈN", "RUOC DEN"] },
      { id: 4, q: "Tết Trung Thu diễn ra vào ngày rằm tháng mấy Âm lịch?", a: ["THÁNG TÁM", "THANG TAM", "8"] },
      { id: 5, q: "Điệu múa dân gian nào thường được biểu diễn trong dịp Tết Trung Thu?", a: ["MÚA LÂN", "MUA LAN"] },
      { id: 6, q: "Theo truyền thuyết, ai là người đã uống thuốc trường sinh và bay lên cung trăng?", a: ["HẰNG NGA", "HANG NGA"] },
      { id: 7, q: "Ngoài bánh nướng, loại bánh Trung Thu còn lại có vỏ ngoài màu trắng, dẻo là gì?", a: ["BÁNH DẺO", "BANH DEO"] },
      { id: 8, q: "Tết Trung Thu chủ yếu là dịp lễ dành cho đối tượng nào?", a: ["THIẾU NHI", "THIEU NHI", "TRẺ EM", "TRE EM"] },
    ],
  }
];

export const TOTAL_QUESTIONS_PER_PUZZLE = 9;
export const QUESTION_TIME_LIMIT_SECONDS = 15 * 60; // 15 minutes
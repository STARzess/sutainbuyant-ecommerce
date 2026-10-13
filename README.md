## Ашигласан технологи: Next.js 16.4 App Router, React 19.3, TypeScript, Tailwind CSS 4 болон React Context, Server Components, Route Handlers, Vitest, Playwright, axe, Lighthouse. Токеныг сервер талд httpOnly cookie-д хадгалдаг.

## Заавар (windows)
1. Node.js суулгана https://nodejs.org/en/download Node.js 24.x LTS. npm хамт суух тул terminal дээр дараах командаар суусан үгүйг нь шалгана: node --version, npm --version
2. PowerShell эсвэл vscode terminal нээгээд төслийн хавтас руу орно: Жишээ нь: cd C:\sutainbuyant-ecommercee
npm ci
npm ci нь package-lock.json-д заасан хувилбаруудаар сангуудыг суулгана.
3. API болон сайтын хаяг тохируулах(Хэрэв файл нь байхгүй бол .env.example доторхыг .env.local үүсгэж copy & paste эсвэл .env.example rename хийж .env.local болгоно)
4. Хөгжүүлэлтийн горимоор ажиллуулах
terminal дээр npm run dev
Production хувилбар ажиллуулах
npm run build
npm start
5. Tests:
npm run lint
npm run typecheck
npm test

E2E тестийн браузерыг эхний удаа суулгаад тест ажиллуулна:
npx playwright install chromium
npm run test:e2e

Lighthouse шалгахдаа production серверээ ажиллуулсан хэвээр үлдээж, өөр terminal дээр:
npm run audit
Тайлангууд lighthouse-report файлд үүснэ.

## Эдгээр шалгалтууд нь 
npm run lint — React-ийн хэрэглээний алдаа эсвэл дүрмийг шалгана.
npm run typecheck — TypeScript-ийн type, parameter зөв эсэхийг шалгана.
npm test — сагсны тооцоо, validation, API хүсэлт, нэвтрэлтийг шалгана.
npx playwright install chromium болон npm run test:E2E browser суулгаж дээр нь хайх, сагслах, нэвтрэх, захиалах зэрэг хэрэглэгчийн үйлдлийг автоматаар шалгана. Mock API ашиглана.
npm run audit — хуудасны хурд, SEO, хүртээмжийг хэмжээд тайлан гаргана (C:/sutainbuyant-ecommercee/lighthouse-report) фолдерт үүснэ.

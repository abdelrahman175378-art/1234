import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // تحميل ملفات البيئة للوصول إلى مفاتيح الـ AI
    const env = loadEnv(mode, '.', '');
    
    // إنشاء بصمة زمنية موحدة لهذا الـ Build لضمان تحديث الكاش عند العميل
    const buildTimestamp = Date.now();

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // تعريف الـ @ ليشير للمجلد الرئيسي
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        
        rollupOptions: {
          output: {
            // الحفاظ على نظام تسمية الملفات الخاص بك مع البصمة الزمنية
            entryFileNames: `assets/[name]-[hash]-${buildTimestamp}.js`,
            chunkFileNames: `assets/[name]-[hash]-${buildTimestamp}.js`,
            assetFileNames: `assets/[name]-[hash]-${buildTimestamp}.[ext]`,
            
            // بروتوكول تقسيم المكتبات (المعدل لحل مشكلة الـ Circular Chunk)
            manualChunks(id) {
              if (id.includes('node_modules')) {
                // فصل الأيقونات لأن حجمها كبير جداً
                if (id.includes('lucide-react')) {
                  return 'vendor-icons';
                }
                // فصل محركات المستندات الثقيلة (PDF/Excel)
                if (id.includes('jspdf') || id.includes('xlsx')) {
                  return 'vendor-documents';
                }
                // وضع باقي المكتبات (React, Firebase, Motion) في ملف واحد
                // هذا يحل مشكلة التداخل (Circular Dependency) ويضمن استقرار التحميل
                return 'vendor-core';
              }
            }
          }
        },
        // حد التحذير 1.5 ميجابايت ليتناسب مع مكتباتك الضخمة
        chunkSizeWarningLimit: 1500,
      }
    };
});
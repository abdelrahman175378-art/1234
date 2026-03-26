import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import emailjs from '@emailjs/browser';

// تهيئة نظام مراسلة البريد الإلكتروني
emailjs.init("J2lsxRIODFwYl5_QJ");

const firebaseConfig = {
  apiKey: "AIzaSyDnk26MKewodK30XkgD9Vk5EvnqG8XkfZA",
  authDomain: "doha-elite-store.firebaseapp.com",
  projectId: "doha-elite-store",
  storageBucket: "doha-elite-store.firebasestorage.app",
  messagingSenderId: "217409684678",
  appId: "1:217409684678:web:a143f05dd6034411d683c7"
};

// إنشاء مثيل التطبيق الأساسي
const app = initializeApp(firebaseConfig);

/**
 * تهيئة قاعدة البيانات مع إضافة ميزة Long Polling 
 * لحل مشكلة ERR_QUIC_PROTOCOL_ERROR وضمان استقرار الاتصال في المتصفحات.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true // هذا السطر هو الحل الجذري للأخطاء الحمراء في الكونسول
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export { ref, uploadBytes, getDownloadURL };

/**
 * وظيفة استعادة كلمة المرور عبر البريد الإلكتروني
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "تم إرسال الرابط بنجاح" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * وظيفة إرسال رمز التحقق (OTP) عبر نظام مصفوفة البريد
 */
export const sendOTP = async (userEmail: string, serviceID: string, templateID: string, publicKey: string) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const templateParams = { email: userEmail, passcode: otpCode, company_name: "AK Atelier" };
  try {
    await emailjs.send(serviceID, templateID, templateParams, publicKey);
    return { success: true, code: otpCode };
  } catch (error: any) {
    return { success: false, message: error.text };
  }
};
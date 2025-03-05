
/**
 * קומפוננטה שאחראית על עדכון ה-manifest של האפליקציה
 * הערה: עדכונים בפועל של קובץ ה-manifest דורשים תמיכת שרת
 * בתצוגת הדפדפן, נשמור את השינויים ב-localStorage
 */

// סוג הנתונים לעדכון
interface ManifestUpdateData {
  name?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
}

// מחלקה סטטית לעדכון ה-manifest
const ManifestUpdater = {
  // מפתח לשמירה ב-localStorage
  LOCAL_STORAGE_KEY: 'app-manifest-overrides',
  
  // פונקציה לעדכון ה-manifest
  updateManifest: async (data: ManifestUpdateData): Promise<boolean> => {
    try {
      // שמירת הערכים בלוקל סטורג'
      const overrides = {
        name: data.name,
        description: data.description,
        theme_color: data.themeColor,
        background_color: data.backgroundColor
      };
      
      localStorage.setItem(ManifestUpdater.LOCAL_STORAGE_KEY, JSON.stringify(overrides));
      
      // עדכון מטא תגיות בדפדפן (עובד גם בלי רענון)
      if (data.themeColor) {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', data.themeColor);
        }
      }
      
      // עדכון הכותרת של הדף
      if (data.name) {
        document.title = data.name;
      }
      
      // הזרקת סקריפט להחלת השינויים בזמן ריענון
      const applyScript = `
        if ('serviceWorker' in navigator) {
          const manifestOverrides = JSON.parse(localStorage.getItem('${ManifestUpdater.LOCAL_STORAGE_KEY}') || '{}');
          
          // הזדמנות ליירט בקשות manifest ולהחזיר גרסה מותאמת אישית
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'MANIFEST_REQUEST') {
              event.ports[0].postMessage({ manifestOverrides });
            }
          });
        }
      `;
      
      // הוספת סקריפט שיפעל אחרי רענון הדף
      const scriptId = 'manifest-override-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.textContent = applyScript;
        document.head.appendChild(script);
      }
      
      return true;
    } catch (error) {
      console.error('שגיאה בעדכון ה-manifest:', error);
      return false;
    }
  },
  
  // פונקציה להחלת השינויים בזמן טעינת האפליקציה
  applyManifestOverrides: () => {
    try {
      const overridesJSON = localStorage.getItem(ManifestUpdater.LOCAL_STORAGE_KEY);
      if (!overridesJSON) return;
      
      const overrides = JSON.parse(overridesJSON);
      
      // החלת ערכים על תגי מטא
      if (overrides.theme_color) {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', overrides.theme_color);
        }
      }
      
      // עדכון כותרת הדף
      if (overrides.name) {
        document.title = overrides.name;
      }
    } catch (error) {
      console.error('שגיאה בהחלת עדכוני ה-manifest:', error);
    }
  }
};

export default ManifestUpdater;

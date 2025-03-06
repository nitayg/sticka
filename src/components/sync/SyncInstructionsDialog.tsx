
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud, Database, Github, Server, Box, HardDrive, Smartphone, Laptop, BookOpen, AlertCircle } from "lucide-react";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SyncInstructionsDialogProps {
  trigger?: React.ReactNode;
}

const SyncInstructionsDialog = ({ trigger }: SyncInstructionsDialogProps) => {
  const { toast } = useToast();
  
  const handleCopyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק ללוח",
      description: "הפקודה הועתקה ללוח",
      duration: 2000,
    });
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2">
      <Cloud className="h-4 w-4" />
      הדרכת סנכרון בין מכשירים
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            הדרכה: סנכרון אלבום המדבקות בין מכשירים
          </DialogTitle>
          <DialogDescription>
            מדריך מפורט להגדרת סנכרון אלבום המדבקות בין מכשירים שונים
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              סקירה כללית
            </TabsTrigger>
            <TabsTrigger value="supabase" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              סנכרון עם Supabase
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              סנכרון ידני
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="bg-muted/40 p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                מה זה סנכרון בין מכשירים?
              </h3>
              <p className="mb-3">
                סנכרון בין מכשירים מאפשר לך לגשת לאלבום המדבקות שלך ולעדכן אותו ממספר מכשירים שונים כגון טלפון נייד, טאבלט או מחשב.
                כל שינוי שתבצע במכשיר אחד יופיע באופן אוטומטי במכשירים האחרים.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-500" />
                    <Laptop className="h-4 w-4 text-blue-500" />
                    יתרונות הסנכרון
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>גישה לאוסף המדבקות שלך מכל מכשיר</li>
                    <li>גיבוי אוטומטי של הנתונים שלך</li>
                    <li>שיתוף קל עם בני משפחה או חברים</li>
                    <li>הגנה מפני אובדן נתונים במקרה של איפוס מכשיר</li>
                    <li>עדכון נוח מכל מקום</li>
                  </ul>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-purple-500" />
                    אפשרויות סנכרון
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Supabase:</strong> פתרון חינמי שכולל בסיס נתונים בענן (מומלץ)</li>
                    <li><strong>Firebase:</strong> שירות ענן של Google עם שכבת בסיס נתונים</li>
                    <li><strong>ייצוא/ייבוא ידני:</strong> העברת קבצים באופן ידני בין מכשירים</li>
                    <li><strong>פיתוח שרת מותאם אישית:</strong> אפשרות מתקדמת למפתחים</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                <h4 className="font-medium mb-1 text-primary">המלצה</h4>
                <p className="text-sm">
                  אנו ממליצים להשתמש ב-Supabase לסנכרון, זהו פתרון קוד פתוח חינמי שהוא גם ידידותי למשתמש וגם מאובטח.
                  עבור משתמשים עם ידע טכני מוגבל, זוהי האפשרות הטובה ביותר.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="supabase" className="space-y-4 mt-4">
            <div className="text-sm bg-muted/40 p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                הקמת שרת סנכרון עם Supabase
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-base">צעד 1: יצירת חשבון Supabase</h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>היכנס לאתר <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase</a> ולחץ על "Start your project"</li>
                    <li>הירשם באמצעות חשבון GitHub או חשבון מייל</li>
                    <li>אשר את כתובת המייל שלך אם נדרש</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base">צעד 2: יצירת פרויקט חדש</h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>לחץ על "New Project" בלוח הבקרה</li>
                    <li>בחר את ארגון ברירת המחדל או צור ארגון חדש</li>
                    <li>תן שם לפרויקט (למשל: "album-sync")</li>
                    <li>הגדר סיסמה חזקה לבסיס הנתונים</li>
                    <li>בחר את המיקום הקרוב אליך ביותר (למשל "West Europe")</li>
                    <li>השאר את התוכנית החינמית (Free plan)</li>
                    <li>לחץ על "Create new project"</li>
                    <li>המתן כדקה עד שהפרויקט יוקם</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base">צעד 3: יצירת טבלאות בבסיס הנתונים</h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>עבור ללשונית "Table Editor" בתפריט הצד</li>
                    <li>לחץ על "New Table" ליצירת טבלה חדשה</li>
                    <li>צור את הטבלאות הבאות:</li>
                  </ol>
                  
                  <div className="bg-card rounded-md p-3 border max-w-lg mx-auto mt-2">
                    <h5 className="font-medium mb-2">טבלת אלבומים (albums)</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-1 px-2">שם העמודה</th>
                            <th className="text-right py-1 px-2">סוג</th>
                            <th className="text-right py-1 px-2">הערות</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 px-2">id</td>
                            <td className="py-1 px-2">uuid</td>
                            <td className="py-1 px-2">מפתח ראשי, ערך ברירת מחדל: uuid_generate_v4()</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">name</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">description</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2"></td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">year</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2"></td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">totalStickers</td>
                            <td className="py-1 px-2">integer</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">coverImage</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2"></td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2">user_id</td>
                            <td className="py-1 px-2">uuid</td>
                            <td className="py-1 px-2">מזהה המשתמש (לשימוש עתידי עם אימות)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-md p-3 border max-w-lg mx-auto mt-4">
                    <h5 className="font-medium mb-2">טבלת מדבקות (stickers)</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-1 px-2">שם העמודה</th>
                            <th className="text-right py-1 px-2">סוג</th>
                            <th className="text-right py-1 px-2">הערות</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-1 px-2">id</td>
                            <td className="py-1 px-2">uuid</td>
                            <td className="py-1 px-2">מפתח ראשי, ערך ברירת מחדל: uuid_generate_v4()</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">name</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">team</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">teamLogo</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2"></td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">category</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">imageUrl</td>
                            <td className="py-1 px-2">text</td>
                            <td className="py-1 px-2"></td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">number</td>
                            <td className="py-1 px-2">integer</td>
                            <td className="py-1 px-2">לא ריק</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">isOwned</td>
                            <td className="py-1 px-2">boolean</td>
                            <td className="py-1 px-2">ערך ברירת מחדל: false</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">isDuplicate</td>
                            <td className="py-1 px-2">boolean</td>
                            <td className="py-1 px-2">ערך ברירת מחדל: false</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">duplicateCount</td>
                            <td className="py-1 px-2">integer</td>
                            <td className="py-1 px-2">ערך ברירת מחדל: 0</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-1 px-2">albumId</td>
                            <td className="py-1 px-2">uuid</td>
                            <td className="py-1 px-2">מפתח זר לטבלת albums</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2">user_id</td>
                            <td className="py-1 px-2">uuid</td>
                            <td className="py-1 px-2">מזהה המשתמש (לשימוש עתידי עם אימות)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base">צעד 4: קבלת פרטי חיבור</h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>עבור ללשונית "Project Settings" (הגדרות פרויקט) בתפריט</li>
                    <li>לחץ על "API" בתפריט המשני</li>
                    <li>תחת "Project URL", העתק את כתובת ה-URL של הפרויקט</li>
                    <li>תחת "Project API Keys", העתק את ה-anon key (מפתח אלמוני)</li>
                    <li>שמור את שני הערכים האלה - תזדקק להם לחיבור האפליקציה</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base">צעד 5: אינטגרציה עם אפליקציית האלבום</h4>
                  <p className="mb-2">כדי לשלב את Supabase באפליקציה שלך, תצטרך לשנות את קוד האפליקציה. יש כמה אפשרויות:</p>
                  
                  <div className="bg-primary/10 p-4 rounded-md border border-primary/20 space-y-2">
                    <h5 className="font-medium">אפשרות 1: ייבוא/ייצוא של קוד מוכן</h5>
                    <p>אנו נוכל לספק לך עדכון מלא של האפליקציה עם תמיכה בסנכרון Supabase.</p>
                    <p className="flex items-start gap-2">
                      <span className="text-primary font-semibold">
                        בקש מאיתנו:
                      </span>
                      <span>"אנא שדרג את האפליקציה לתמיכה מלאה ב-Supabase עבור סנכרון בין מכשירים"</span>
                    </p>
                  </div>
                  
                  <div className="bg-card p-4 rounded-md border mt-2">
                    <h5 className="font-medium">אפשרות 2: חיבור ידני (למתכנתים)</h5>
                    <p className="mb-2">אם אתה מפתח, תוכל לשלב את Supabase באופן ידני:</p>
                    <ol className="list-decimal list-inside space-y-2 mr-4 text-sm">
                      <li>התקן את חבילת supabase-js:<pre className="bg-muted p-2 rounded-md mt-1 text-xs whitespace-pre-wrap relative">
                        npm install @supabase/supabase-js
                        <button 
                          className="absolute top-1 right-1 p-1 hover:bg-background rounded" 
                          onClick={() => handleCopyCommand("npm install @supabase/supabase-js")}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </pre></li>
                      <li>צור קובץ תצורה עבור Supabase:<pre className="bg-muted p-2 rounded-md mt-1 text-xs whitespace-pre-wrap relative">
{`// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)`}
                        <button 
                          className="absolute top-1 right-1 p-1 hover:bg-background rounded" 
                          onClick={() => handleCopyCommand(`// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)`)}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </pre></li>
                      <li>עדכן את פונקציות הפעולה בקבצים album-operations.ts ו-sticker-operations.ts כדי להשתמש ב-Supabase במקום localStorage</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="bg-muted/40 p-4 rounded-lg border">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                סנכרון ידני בין מכשירים
              </h3>
              
              <div className="space-y-5">
                <p>
                  אם אינך רוצה להשתמש בפתרון סנכרון בענן כמו Supabase או Firebase, אתה יכול להשתמש בשיטת הסנכרון הידני.
                  זוהי אפשרות פשוטה יותר, אך היא מחייבת יותר צעדים ידניים בכל פעם שאתה רוצה לסנכרן את הנתונים שלך.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-amber-500" />
                    ייצוא נתונים ממכשיר אחד
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>פתח את הקונסולה של הדפדפן (F12 או לחץ ימני ובחר "בדוק" או "Inspect")</li>
                    <li>עבור ללשונית "Console" (קונסולה)</li>
                    <li>הקלד את הפקודות הבאות כדי לייצא את הנתונים:
                      <pre className="bg-muted p-2 rounded-md mt-1 text-xs whitespace-pre-wrap relative">
{`// ייצוא אלבומים
const albums = JSON.parse(localStorage.getItem('albums'));
console.log(JSON.stringify(albums));

// ייצוא מדבקות
const stickers = JSON.parse(localStorage.getItem('stickers'));
console.log(JSON.stringify(stickers));

// ייצוא הכל ביחד
const exportData = {
  albums: JSON.parse(localStorage.getItem('albums')),
  stickers: JSON.parse(localStorage.getItem('stickers')),
  recycledAlbums: JSON.parse(localStorage.getItem('recycledAlbums'))
};
console.log(JSON.stringify(exportData));`}
                        <button 
                          className="absolute top-1 right-1 p-1 hover:bg-background rounded" 
                          onClick={() => handleCopyCommand(`// ייצוא אלבומים
const albums = JSON.parse(localStorage.getItem('albums'));
console.log(JSON.stringify(albums));

// ייצוא מדבקות
const stickers = JSON.parse(localStorage.getItem('stickers'));
console.log(JSON.stringify(stickers));

// ייצוא הכל ביחד
const exportData = {
  albums: JSON.parse(localStorage.getItem('albums')),
  stickers: JSON.parse(localStorage.getItem('stickers')),
  recycledAlbums: JSON.parse(localStorage.getItem('recycledAlbums'))
};
console.log(JSON.stringify(exportData));`)}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </pre>
                    </li>
                    <li>העתק את התוצאה המופיעה בקונסולה לקובץ טקסט על המחשב שלך</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-base flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    ייבוא נתונים למכשיר אחר
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 mr-4">
                    <li>פתח את הקונסולה של הדפדפן במכשיר החדש</li>
                    <li>הדבק ובצע את הקוד הבא, החלף את ה-JSON בנתונים שייצאת:
                      <pre className="bg-muted p-2 rounded-md mt-1 text-xs whitespace-pre-wrap relative">
{`// ייבוא נתונים מלאים
const importData = YOUR_EXPORTED_JSON_HERE;

// שמירת האלבומים
localStorage.setItem('albums', JSON.stringify(importData.albums));

// שמירת המדבקות
localStorage.setItem('stickers', JSON.stringify(importData.stickers));

// שמירת סל המיחזור
localStorage.setItem('recycledAlbums', JSON.stringify(importData.recycledAlbums));

// רענון העמוד
window.location.reload();`}
                        <button 
                          className="absolute top-1 right-1 p-1 hover:bg-background rounded" 
                          onClick={() => handleCopyCommand(`// ייבוא נתונים מלאים
const importData = YOUR_EXPORTED_JSON_HERE;

// שמירת האלבומים
localStorage.setItem('albums', JSON.stringify(importData.albums));

// שמירת המדבקות
localStorage.setItem('stickers', JSON.stringify(importData.stickers));

// שמירת סל המיחזור
localStorage.setItem('recycledAlbums', JSON.stringify(importData.recycledAlbums));

// רענון העמוד
window.location.reload();`)}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </pre>
                    </li>
                    <li>החלף את YOUR_EXPORTED_JSON_HERE בנתונים שייצאת מהמכשיר הראשון</li>
                    <li>לחץ Enter לביצוע הפקודה</li>
                    <li>הדף יתרענן והנתונים המיובאים יוצגו</li>
                  </ol>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    חשוב לדעת
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>שיטה זו תחליף את כל הנתונים במכשיר היעד. נתונים קיימים יאבדו!</li>
                    <li>בצע גיבוי לפני ביצוע הייבוא למכשיר חדש</li>
                    <li>הסנכרון אינו אוטומטי - אתה צריך לבצע אותו באופן ידני בכל פעם</li>
                    <li>אפשרות זו מוגבלת ואינה מומלצת לשימוש ארוך טווח</li>
                  </ul>
                </div>
                
                <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                  <h4 className="font-medium mb-1 text-primary">המלצה</h4>
                  <p className="text-sm">
                    סנכרון ידני הוא פתרון זמני בלבד. לחוויית משתמש טובה יותר ולמניעת אובדן נתונים, מומלץ לשדרג לפתרון סנכרון אוטומטי באמצעות Supabase או Firebase.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              סגור
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncInstructionsDialog;

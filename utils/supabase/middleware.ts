diff --git a/utils/supabase/middleware.ts b/utils/supabase/middleware.ts
index 8cc8eb1341282024d898941ac591611b570eff9d..42858091863a6d2a2100d59d61b68923ea9771e1 100644
--- a/utils/supabase/middleware.ts
+++ b/utils/supabase/middleware.ts
@@ -1,25 +1,27 @@
 import { createServerClient } from "@supabase/ssr";
 import { NextResponse, type NextRequest } from "next/server";
 
 export async function updateSession(request: NextRequest) {
   let response = NextResponse.next({ request });
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if (!url || !key) return response;
 
   const supabase = createServerClient(url, key, {
     cookies: {
       getAll() {
         return request.cookies.getAll();
       },
       setAll(cookiesToSet) {
-        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
+        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
         response = NextResponse.next({ request });
-        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
+        cookiesToSet.forEach(({ name, value, options }) =>
+          response.cookies.set(name, value, options),
+        );
       },
     },
   });
 
   await supabase.auth.getUser();
   return response;
 }

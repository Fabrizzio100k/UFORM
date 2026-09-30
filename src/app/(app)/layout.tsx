import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { AppHeader } from "@/components/app-header";

// Resuelve la sesión en el servidor (sin fetch en el cliente) para que el
// nombre del jurado y el estado de "ingresado" aparezcan ya resueltos en el
// primer render del header, sin parpadeo al navegar entre páginas.
async function getJuradoNombre() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return undefined;

  const session = await verifySessionToken(token);
  if (!session) return undefined;

  const jurado = await prisma.jurado.findUnique({
    where: { id: session.sub },
    select: { fullName: true },
  });

  return jurado?.fullName;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const juradoName = await getJuradoNombre();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader juradoName={juradoName} />
      {children}
    </div>
  );
}

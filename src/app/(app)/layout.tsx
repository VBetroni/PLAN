import { BottomBars } from "@/components/app/bottom-bars";
import { QuickAdd } from "@/features/items/components/quick-add";

// Shell of the logged-in app: content on top, capture field + tab bar always at the bottom.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <div className="flex-1 px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-6">{children}</div>
      <BottomBars>
        <QuickAdd />
      </BottomBars>
    </div>
  );
}

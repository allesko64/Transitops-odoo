import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
      <h1 className="text-2xl font-semibold">TransitOps</h1>
      <p className="text-muted-foreground">Scaffold is up.</p>
      <Button>It works</Button>
    </div>
  );
}

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-3xl font-bold text-purple-700">Pi Fiverr Marketplace</h1>
      <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
        Khám phá ngay
      </Button>
    </div>
  )
}
import Link from "next/link"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden select-none">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10">
        {/* Decorative 404 Badge with green gradient and border */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-inner">
          <FileQuestion className="h-12 w-12 stroke-[1.5]" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan ke alamat lain.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a 
            href="javascript:history.back()" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border border-border/60 rounded-md text-sm font-medium hover:bg-muted/50 transition-colors text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </a>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-md shadow-md hover:shadow-lg transition-all text-sm"
          >
            <Home className="h-4 w-4" /> Menu Utama
          </Link>
        </div>

        {/* Footer/Trademark */}
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest pt-8">
          Indonesia Youth Talent
        </p>
      </div>
    </div>
  )
}

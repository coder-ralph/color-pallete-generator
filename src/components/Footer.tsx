export default function Footer() {
  return (
    <footer className="bg-card text-card-foreground mt-8 border-t border-border">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm sm:text-lg">
          &copy; {new Date().getFullYear()} Pallete Generator. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

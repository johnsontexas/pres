import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Countdown } from "@/components/countdown"
import { About } from "@/components/about"
import { Platform } from "@/components/platform"
import { Quote } from "@/components/quote"
import { CallToAction } from "@/components/call-to-action"
import { SiteFooter } from "@/components/site-footer"

export default function CampaignPage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <Countdown />
      <About />
      <Platform />
      <Quote />
      <div id="vote">
        <CallToAction />
      </div>
      <SiteFooter />
    </main>
  )
}

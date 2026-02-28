import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { Countdown } from "@/components/countdown"
import { Platform } from "@/components/platform"
import { Quote } from "@/components/quote"
import { Contact } from "@/components/contact"
import { CallToAction } from "@/components/call-to-action"
import { SiteFooter } from "@/components/site-footer"

export default function CampaignPage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <Countdown />
      <Platform />
      <Quote />
      <Contact />
      <div id="vote">
        <CallToAction />
      </div>
      <SiteFooter />
    </main>
  )
}

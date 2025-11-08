"use client"

import Link from "next/link"
import * as React from "react"
import { AppLogo } from "@/components/svgs/logo"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"

export function NavBar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[#ececf3] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-20">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Powder home"
          className="flex items-center gap-2"
        >
          <AppLogo className="text-black" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:block">
          <NavigationMenu viewport={false}>
            <NavigationMenuList className="flex items-center gap-6 lg:gap-9">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[220px] gap-2 p-3">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          Product 1
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          Product 2
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          Product 3
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[220px] gap-2 p-3">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          About us
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          Our Partners
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link className="cursor-pointer" href="#">
                          Our Teams
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href="/blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* CTA (always visible) */}
        <div className="hidden md:flex w-[156px] items-center justify-end">
          <Link
            href="/signup"
            className="h-9 rounded-[8px] bg-[#4C1CE0] px-3 hover:bg-[#4C1CE0]/85 inline-flex items-center justify-center gap-2 whitespace-nowrap text-base text-white leading-[120%] tracking-normal font-hnd font-bold transition-all cursor-pointer"
          >
            Get started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="h-12 w-12 rounded-md"
              >
                <Menu className="h-9 w-9" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="px-4 py-3">
                <SheetTitle className="flex items-center gap-2">
                  <AppLogo className="text-black" />
                </SheetTitle>
              </SheetHeader>
              <Separator />

              {/* Mobile nav list */}
              <div className="px-2 py-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="products" className="border-none">
                    <AccordionTrigger className="px-2 py-2 text-[15px]">
                      Products
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <nav className="grid gap-1">
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            Product 1
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            Product 2
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            Product 3
                          </Link>
                        </SheetClose>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="company" className="border-none">
                    <AccordionTrigger className="px-2 py-2 text-[15px]">
                      Company
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <nav className="grid gap-1">
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            About us
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            Our Partners
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            className="rounded-md px-2 py-2 cursor-pointer"
                            href="#"
                          >
                            Our Teams
                          </Link>
                        </SheetClose>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Single links */}
                <div className="mt-1 px-2">
                  <SheetClose asChild>
                    <Link
                      className="block rounded-md px-2 py-2 cursor-pointer"
                      href="/blog"
                    >
                      Blog
                    </Link>
                  </SheetClose>
                </div>

                <Separator className="my-3" />

                {/* CTA inside sheet */}
                <div className="px-2 pb-4">
                  <SheetClose asChild>
                    <Link
                      href="/signup"
                      className="w-full mt-8 h-9 rounded-[8px] bg-[#4C1CE0] px-3 hover:bg-[#4C1CE0]/85 inline-flex items-center justify-center gap-2 whitespace-nowrap text-base text-white leading-[120%] tracking-normal font-hnd font-bold transition-all cursor-pointer"
                    >
                      Get started
                    </Link>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

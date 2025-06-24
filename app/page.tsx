'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import Layout from '@/layout/layout';
import { CheckCircle2, Github, Globe, MessageSquare, Rocket, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LandingPage() {
  const router = useRouter();
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-background py-20 text-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Seamless i18n Management for Your Website
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-lg">
                  Say goodbye to managing messy translation files! Effortlessly manage, sync, and
                  collaborate on i18n files with GitHub integration. Ensure consistency across all
                  languages—no missing keys, no manual hassle.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => router.push('/home')}>
                  Get Started for Free
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">👉 Sync. Collaborate. Automate.</p>
            </div>
            <div className="flex justify-center">
              <DemoCard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to manage your i18n files efficiently
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-primary" />}
              title="Tabulated Language View"
              description="Easily compare and edit translation files in an intuitive table format."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Advanced Filtering"
              description="Find missing keys, outdated translations, and inconsistencies quickly."
            />
            <FeatureCard
              icon={<Github className="h-10 w-10 text-primary" />}
              title="GitHub Integration"
              description="Connect your repo, sync changes, and commit directly from the UI."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-primary" />}
              title="Collaboration Made Easy"
              description="Work with your team in real time to manage translations."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
              title="Automatic Key Checks"
              description="Detect missing keys across translation files."
            />
            <FeatureCard
              icon={<Rocket className="h-10 w-10 text-primary" />}
              title="AI-Powered Translation"
              description="Coming Soon: Let AI scan and suggest missing language keys."
              isSoon={true}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section className="bg-muted/50 py-20" id="pricing">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Coming Soon</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <PricingCard
              title="Free"
              description="Perfect for individual developers"
              features={[
                'Single user',
                'Manage one GitHub repo',
                'Basic translation management',
                'Manual sync with GitHub',
              ]}
              price="$0"
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              title="Pro"
              description="For growing teams and projects"
              features={[
                'Multi-user collaboration',
                'Automatic PRs with AI-generated values',
                'Direct commit to branch from the UI',
                'Advanced filtering and search',
                'Priority email support',
              ]}
              price="$19"
              buttonText="Upgrade to Pro"
              buttonVariant="default"
              popular={true}
            />
            <PricingCard
              title="Enterprise"
              description="For large organizations"
              features={[
                'Custom workflows',
                'Priority support',
                'Dedicated features',
                'SSO authentication',
                'Custom integrations',
                'Dedicated account manager',
              ]}
              price="Contact us"
              buttonText="Contact Sales"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-medium ">i18n Forge</h3>
              <p className="text-sm">
                Seamless i18n management for your website. Say goodbye to messy translation files!
              </p>
            </div>
            {/* <div>
              <h3 className="mb-4 text-lg font-medium text-primary-foreground">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-primary-foreground">
                    Features
                  </a>
                </li>
                 <li>
                  <a href="#pricing" className="hover:text-primary-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Roadmap
                  </a>
                </li> 
              </ul>
            </div> */}
            {/* <div>
              <h3 className="mb-4 text-lg font-medium text-primary-foreground">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium text-primary-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div> */}
          </div>
          <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} i18n Forge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  isSoon?: boolean;
}

function FeatureCard({ icon, title, description, isSoon = false }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="flex items-center gap-2">
          {title}
          {isSoon && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Coming Soon
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface PricingCardProps {
  title: string;
  description: string;
  features: string[];
  price: string;
  buttonText: string;
  buttonVariant: 'outline' | 'default';
  popular?: boolean;
}

function PricingCard({
  title,
  description,
  features,
  price,
  buttonText,
  buttonVariant,
  popular = false,
}: PricingCardProps) {
  return (
    <Card className={`relative overflow-hidden ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Contact us' && <span className="text-slate-600">/month</span>}
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant={buttonVariant} className="w-full">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

const DemoCard = () => {
  return (
    <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-xl bg-card/90 p-2 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-50"></div>
      <div className="relative h-full w-full rounded-lg bg-card p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <div className="ml-2 text-xs text-muted-foreground">i18n Forge Dashboard</div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 border-b border-border pb-2">
          <div className="col-span-1 text-xs font-medium text-muted-foreground">Key</div>
          <div className="col-span-1 text-xs font-medium text-muted-foreground">English</div>
          <div className="col-span-1 text-xs font-medium text-muted-foreground">Spanish</div>
          <div className="col-span-1 text-xs font-medium text-muted-foreground">French</div>
        </div>
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="mt-2 grid grid-cols-4 gap-2">
            <div className="col-span-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              welcome.title
            </div>
            <div className="col-span-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              Welcome
            </div>
            <div className="col-span-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              Bienvenido
            </div>
            <div className="col-span-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              Bienvenue
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

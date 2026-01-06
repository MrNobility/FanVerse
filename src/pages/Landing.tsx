import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Shield, DollarSign, MessageCircle, Users, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/feed');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: DollarSign,
      title: 'Monetize Your Content',
      description: 'Set your own subscription price and earn from tips, PPV, and more.'
    },
    {
      icon: MessageCircle,
      title: 'Direct Messages',
      description: 'Connect directly with your fans through private messaging.'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Control who sees your content with flexible privacy settings.'
    },
    {
      icon: Users,
      title: 'Build Your Community',
      description: 'Grow your audience and create a loyal fanbase.'
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Get paid quickly with our reliable payment system.'
    },
    {
      icon: Sparkles,
      title: 'Exclusive Content',
      description: 'Share premium content that your fans will love.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="font-display text-xl font-bold gradient-text">FanVerse</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="gradient-primary" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Connect with your fans.
              <br />
              <span className="gradient-text">Earn what you deserve.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              The platform where creators share exclusive content and build meaningful connections with their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary text-lg px-8" asChild>
                <Link to="/signup">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/discover">
                  Explore Creators
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">10K+</p>
              <p className="text-muted-foreground">Creators</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">1M+</p>
              <p className="text-muted-foreground">Fans</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">$50M+</p>
              <p className="text-muted-foreground">Paid Out</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Powerful tools to help you create, connect, and earn.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIgMS44LTQgNC00czQgMS44IDQgNC0xLjggNC00IDQtNC0xLjgtNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to start earning?
              </h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Join thousands of creators who are building their businesses on FanVerse.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8"
                asChild
              >
                <Link to="/signup">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="font-display text-xl font-bold">FanVerse</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground">Terms</Link>
              <Link to="#" className="hover:text-foreground">Privacy</Link>
              <Link to="#" className="hover:text-foreground">Support</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FanVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

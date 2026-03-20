import { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, Instagram, Phone, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const mainRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);

  // Hero load animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero background entrance
      gsap.fromTo(heroBgRef.current,
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      );

      // Hero content entrance
      const heroContent = heroContentRef.current;
      if (heroContent) {
        const headline = heroContent.querySelector('.hero-headline');
        const subheadline = heroContent.querySelector('.hero-subheadline');
        const ctas = heroContent.querySelector('.hero-ctas');

        const tl = gsap.timeline({ delay: 0.3 });
        
        if (headline) {
          const words = headline.querySelectorAll('.word');
          tl.fromTo(words,
            { opacity: 0, y: 40, rotateX: 35 },
            { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
          );
        }
        
        if (subheadline) {
          tl.fromTo(subheadline,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          );
        }
        
        if (ctas) {
          tl.fromTo(ctas,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
            '-=0.3'
          );
        }
      }
    });

    return () => ctx.revert();
  }, []);

  // Scroll-driven animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>('.pinned-section');
      
      sections.forEach((section, index) => {
        const isLast = index === sections.length - 1;
        
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: isLast ? '+=100%' : '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset section when scrolling back to top
            if (index === 0) {
              gsap.set(section.querySelectorAll('.hero-content'), { opacity: 1, x: 0 });
            }
          }
        });

        // Entrance animations
        const photoCard = section.querySelector('.photo-card');
        const titleLines = section.querySelectorAll('.title-line');
        const contentBlocks = section.querySelectorAll('.content-block');
        
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=30%',
            scrub: 0.6,
          }
        });

        // Photo card entrance
        if (photoCard) {
          const isRight = photoCard.classList.contains('right-side');
          entranceTl.fromTo(photoCard,
            { x: isRight ? '60vw' : '-60vw', opacity: 0, rotate: isRight ? 2 : -2 },
            { x: 0, opacity: 1, rotate: 0, ease: 'none' },
            0
          );
        }

        // Title lines entrance
        if (titleLines.length) {
          titleLines.forEach((line, i) => {
            const isLeft = line.classList.contains('left-side');
            entranceTl.fromTo(line,
              { x: isLeft ? '-60vw' : '60vw', opacity: 0 },
              { x: 0, opacity: 1, ease: 'none' },
              0.05 + i * 0.03
            );
          });
        }

        // Content blocks entrance
        if (contentBlocks.length) {
          entranceTl.fromTo(contentBlocks,
            { y: '10vh', opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
            0.1
          );
        }

        // Exit animations
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: '+=70%',
            end: isLast ? '+=30%' : '+=60%',
            scrub: 0.6,
          }
        });

        if (photoCard) {
          const isRight = photoCard.classList.contains('right-side');
          exitTl.to(photoCard,
            { x: isRight ? '18vw' : '-18vw', opacity: 0, ease: 'none' },
            0
          );
        }

        if (titleLines.length) {
          titleLines.forEach((line) => {
            const isLeft = line.classList.contains('left-side');
            exitTl.to(line,
              { x: isLeft ? '-40vw' : '40vw', opacity: 0, ease: 'none' },
              0
            );
          });
        }

        if (contentBlocks.length) {
          exitTl.to(contentBlocks,
            { y: '8vh', opacity: 0, ease: 'none' },
            0
          );
        }
      });

      // Global snap for pinned sections
      const pinned = ScrollTrigger.getAll().filter(st => st.vars.pin).sort((a, b) => a.start - b.start);
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (maxScroll && pinned.length) {
        const pinnedRanges = pinned.map(st => ({
          start: st.start / maxScroll,
          end: (st.end ?? st.start) / maxScroll,
          center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
        }));

        ScrollTrigger.create({
          snap: {
            snapTo: (value) => {
              const inPinned = pinnedRanges.some(r => value >= r.start - 0.02 && value <= r.end + 0.02);
              if (!inPinned) return value;
              
              const target = pinnedRanges.reduce((closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0);
              
              return target;
            },
            duration: { min: 0.15, max: 0.35 },
            delay: 0,
            ease: 'power2.out',
          }
        });
      }
    }, mainRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll('.pinned-section, .flowing-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={mainRef} className="relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[4vw] py-4">
        <div className="label-mono text-ink">Gadget Dogs</div>
        <div className="flex items-center gap-4">
          <button className="label-mono text-ink hover:text-signal transition-colors flex items-center gap-2">
            <Menu size={18} />
            Menu
          </button>
          <Button 
            className="bg-signal text-white rounded-full px-5 py-2 label-mono hover:bg-signal/90 transition-colors"
            onClick={() => scrollToSection(8)}
          >
            Book
          </Button>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section ref={heroRef} className="pinned-section relative w-screen h-screen overflow-hidden z-10">
        <div 
          ref={heroBgRef}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src="/images/Frankwithdog.png" 
            alt="Frank with dog"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/30 to-transparent" />
        </div>
        
        <div ref={heroContentRef} className="hero-content relative z-10 h-full flex flex-col justify-center px-[6vw]">
          <div className="max-w-[72vw]">
            <h1 className="hero-headline heading-display text-white mb-6" style={{ fontSize: 'clamp(48px, 9vw, 140px)' }}>
              <span className="word inline-block">GADGET</span>
              <br />
              <span className="word inline-block">DOGS</span>
              <br />
              <span className="word inline-block">TRAINING</span>
            </h1>
            
            <p className="hero-subheadline text-white/90 text-lg md:text-xl max-w-[44vw] mb-8 leading-relaxed">
              Houston-based, positive-reinforcement training for everyday life—and big adventures.
            </p>
            
            <div className="hero-ctas flex flex-wrap gap-4">
              <Button 
                className="bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
                onClick={() => scrollToSection(8)}
              >
                Book a free consult
              </Button>
              <Button 
                variant="outline"
                className="border-white/40 text-white bg-white/10 rounded-full px-8 py-6 text-base font-semibold hover:bg-white/20 transition-all"
                onClick={() => scrollToSection(1)}
              >
                See programs
              </Button>
            </div>
          </div>
          
          <div className="absolute bottom-[4vh] right-[4vw] label-mono text-white/60 animate-bounce-subtle">
            Scroll to explore
          </div>
        </div>
      </section>

      {/* Section 2: Obedience */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-20 bg-butter">
        <div className="photo-card left-side absolute left-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/conditioningcolor.png" 
            alt="Dog obedience training"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[54vw] top-[14vh] w-[40vw]">
          <h2 className="title-line right-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            OBEDIENCE
          </h2>
          <h3 className="title-line right-side heading-display text-ink/70 mb-6" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
            FUNDAMENTALS
          </h3>
          
          <p className="content-block text-ink/80 text-lg mb-6 leading-relaxed">
            Sit, stay, come, leash manners, and polite greetings—built to last.
          </p>
          
          <ul className="content-block space-y-3 mb-8">
            {['In-home sessions available', 'Custom homework + video notes', 'Progress checkpoints'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/70">
                <span className="w-2 h-2 bg-signal rounded-full" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Start Obedience
          </Button>
        </div>
      </section>

      {/* Section 3: Behavioral Mod */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-30 bg-mint">
        <div className="photo-card right-side absolute right-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/freeReactivity.png" 
            alt="Behavioral modification training"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[6vw] top-[14vh] w-[40vw]">
          <h2 className="title-line left-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            BEHAVIORAL
          </h2>
          <h3 className="title-line left-side heading-display text-ink/70 mb-6" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
            MOD
          </h3>
          
          <p className="content-block text-ink/80 text-lg mb-6 leading-relaxed">
            Reactivity, leash frustration, anxiety, and habit change—without force.
          </p>
          
          <ul className="content-block space-y-3 mb-8">
            {['Calm-down protocols', 'Trigger-stacking prevention', 'Owner coaching + follow-ups'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/70">
                <span className="w-2 h-2 bg-signal rounded-full" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Get Help
          </Button>
        </div>
      </section>

      {/* Section 4: Trick Training */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-40 bg-tangerine">
        <div className="photo-card left-side absolute left-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/jumping.png" 
            alt="Trick training"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[54vw] top-[14vh] w-[40vw]">
          <h2 className="title-line right-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            TRICK
          </h2>
          <h3 className="title-line right-side heading-display text-ink/70 mb-6" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
            TRAINING
          </h3>
          
          <p className="content-block text-ink/80 text-lg mb-6 leading-relaxed">
            Spin, crawl, high-five, and playful chains that sharpen focus.
          </p>
          
          <ul className="content-block space-y-3 mb-8">
            {['Beginner → advanced chains', 'Great for kids + family', 'Video-ready coaching'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/70">
                <span className="w-2 h-2 bg-signal rounded-full" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Learn Tricks
          </Button>
        </div>
      </section>

      {/* Section 5: Agility */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-50 bg-sky">
        <div className="photo-card right-side absolute right-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/impulsecontrol.png" 
            alt="Agility training"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[6vw] top-[14vh] w-[40vw]">
          <h2 className="title-line left-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            AGILITY
          </h2>
          <h3 className="title-line left-side heading-display text-ink/70 mb-6" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
            FUN-RUN
          </h3>
          
          <p className="content-block text-ink/80 text-lg mb-6 leading-relaxed">
            Jumps, tunnels, weaves, and handling basics for every breed.
          </p>
          
          <ul className="content-block space-y-3 mb-8">
            {['Foundation fitness first', 'Safe equipment + spacing', 'Handler timing drills'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/70">
                <span className="w-2 h-2 bg-signal rounded-full" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Try Agility
          </Button>
        </div>
      </section>

      {/* Section 6: Retrieval */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-[60] bg-butter">
        <div className="photo-card left-side absolute left-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/onleash.png" 
            alt="Retrieval training"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[54vw] top-[14vh] w-[40vw]">
          <h2 className="title-line right-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(40px, 7vw, 100px)' }}>
            RETRIEVAL
          </h2>
          <h3 className="title-line right-side heading-display text-ink/70 mb-6" style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>
            SKILLS
          </h3>
          
          <p className="content-block text-ink/80 text-lg mb-6 leading-relaxed">
            Fetch with control: mark, send, hold, and deliver to hand.
          </p>
          
          <ul className="content-block space-y-3 mb-8">
            {['Soft-mouth hold training', 'Directional sends', 'Distraction-proofing'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-ink/70">
                <span className="w-2 h-2 bg-signal rounded-full" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Train Retrieve
          </Button>
        </div>
      </section>

      {/* Section 7: Meet Frank */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-[70] bg-mint">
        <div className="photo-card right-side absolute right-[6vw] top-[14vh] w-[42vw] h-[72vh] rounded-3xl overflow-hidden shadow-card">
          <img 
            src="/images/Frank.png" 
            alt="Frank Chen - Dog Trainer"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute left-[6vw] top-[14vh] w-[40vw]">
          <h2 className="title-line left-side heading-display text-ink mb-2" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>
            MEET
          </h2>
          <h2 className="title-line left-side heading-display text-ink mb-6" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>
            FRANK
          </h2>
          
          <p className="content-block text-ink/80 text-base mb-4 leading-relaxed">
            Trainer Frank has a diverse background in the animal-related industry, having worked in a research lab, vet office, farm, zoo, shelter, and dog training facility.
          </p>
          
          <p className="content-block text-ink/80 text-base mb-4 leading-relaxed">
            Graduated from Texas A&M in 2019 with a major in Animal Science and a minor in Psychology. Completed dog training program with Petkennect in 2022.
          </p>
          
          <div className="content-block bg-white/50 rounded-2xl p-4 mb-6">
            <p className="text-ink/70 text-sm italic">
              "My passion is improving human-animal relationships through clear communication and positive reinforcement."
            </p>
          </div>
          
          <Button 
            className="content-block bg-signal text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-105"
            onClick={() => scrollToSection(8)}
          >
            Work With Frank
          </Button>
        </div>
      </section>

      {/* Section 8: Success Stories */}
      <section className="pinned-section relative w-screen h-screen overflow-hidden z-[80] bg-tangerine">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[6vw]">
          <h2 className="title-line heading-display text-ink mb-4 text-center" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>
            OUR FIRST
          </h2>
          <h2 className="title-line heading-display text-ink mb-12 text-center" style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}>
            GRADUATES
          </h2>
          
          <div className="content-block flex flex-col md:flex-row gap-8 max-w-4xl">
            <div className="bg-white/60 rounded-3xl p-8 flex-1">
              <div className="w-20 h-20 bg-signal/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-ink text-center mb-2">Cooper</h3>
              <p className="text-ink/70 text-center mb-4">Freshly graduated our 10 day Puppy Training!</p>
              <div className="flex justify-center">
                <span className="bg-signal text-white text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full">
                  Puppy Grad
                </span>
              </div>
            </div>
            
            <div className="bg-white/60 rounded-3xl p-8 flex-1">
              <div className="w-20 h-20 bg-signal/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">🐕</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-ink text-center mb-2">Groot</h3>
              <p className="text-ink/70 text-center mb-4">Our board and train 15 day canine bachelor</p>
              <div className="flex justify-center">
                <span className="bg-signal text-white text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full">
                  Board & Train
                </span>
              </div>
            </div>
          </div>
          
          <div className="content-block mt-12 bg-signal text-white rounded-3xl px-8 py-6 text-center">
            <p className="label-mono mb-2">Early Bird Special</p>
            <p className="font-display font-bold text-3xl mb-2">$200 OFF</p>
            <p className="text-white/80">on all board/play and train programs!</p>
          </div>
        </div>
      </section>

      {/* Section 9: Contact */}
      <section className="flowing-section relative w-full min-h-screen z-[90] bg-paper py-20">
        <div className="max-w-6xl mx-auto px-[6vw]">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div>
              <h2 className="heading-display text-ink mb-4" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
                Ready when you are.
              </h2>
              <p className="text-ink/70 text-lg mb-8 leading-relaxed">
                Tell us your goals and your dog's personality. We'll recommend a program and schedule your first session.
              </p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-mono text-ink/60 mb-2 block">Your Name</label>
                    <Input 
                      placeholder="John Doe" 
                      className="bg-white border-ink/10 rounded-xl py-6"
                    />
                  </div>
                  <div>
                    <label className="label-mono text-ink/60 mb-2 block">Dog's Name</label>
                    <Input 
                      placeholder="Buddy" 
                      className="bg-white border-ink/10 rounded-xl py-6"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="label-mono text-ink/60 mb-2 block">Email</label>
                  <Input 
                    type="email"
                    placeholder="you@example.com" 
                    className="bg-white border-ink/10 rounded-xl py-6"
                  />
                </div>
                
                <div>
                  <label className="label-mono text-ink/60 mb-2 block">Phone</label>
                  <Input 
                    type="tel"
                    placeholder="(713) 555-0123" 
                    className="bg-white border-ink/10 rounded-xl py-6"
                  />
                </div>
                
                <div>
                  <label className="label-mono text-ink/60 mb-2 block">Your Goals</label>
                  <Textarea 
                    placeholder="What would you like to work on with your dog?"
                    className="bg-white border-ink/10 rounded-xl min-h-[120px]"
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-signal text-white rounded-full py-6 text-base font-semibold hover:bg-signal/90 transition-all hover:scale-[1.02]"
                >
                  Request a call
                </Button>
              </form>
            </div>
            
            {/* Right: Info */}
            <div className="md:pl-8">
              <div className="bg-white rounded-3xl p-8 shadow-card mb-8">
                <img 
                  src="/images/Gadget Dogs logo.jpeg" 
                  alt="Gadget Dogs Logo"
                  className="w-32 h-32 object-contain mb-6 mx-auto"
                />
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-signal mt-1" size={20} />
                    <div>
                      <p className="label-mono text-ink/60 mb-1">Location</p>
                      <p className="text-ink">Houston, Texas</p>
                      <p className="text-ink/60 text-sm">In-home lessons available</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="text-signal mt-1" size={20} />
                    <div>
                      <p className="label-mono text-ink/60 mb-1">Call or Text</p>
                      <a href="tel:713-835-8322" className="text-ink hover:text-signal transition-colors">
                        713-835-8322
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="text-signal mt-1" size={20} />
                    <div>
                      <p className="label-mono text-ink/60 mb-1">Email</p>
                      <a href="mailto:primal.awakes.llc@gmail.com" className="text-ink hover:text-signal transition-colors">
                        primal.awakes.llc@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Clock className="text-signal mt-1" size={20} />
                    <div>
                      <p className="label-mono text-ink/60 mb-1">Hours</p>
                      <p className="text-ink">Mon–Sat: 8am–7pm</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-ink rounded-3xl p-8 text-white">
                <p className="label-mono text-white/60 mb-4">Follow Us</p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.instagram.com/gadgetdogs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-5 py-3"
                  >
                    <Instagram size={18} />
                    <span className="text-sm font-medium">Instagram</span>
                    <ExternalLink size={14} className="opacity-60" />
                  </a>
                  <a 
                    href="https://www.tiktok.com/@gadgetdogs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-5 py-3"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span className="text-sm font-medium">TikTok</span>
                    <ExternalLink size={14} className="opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-ink/10 text-center">
            <p className="label-mono text-ink/40">
              © 2024 Gadget Dogs Training. All rights reserved.
            </p>
            <p className="text-ink/40 text-sm mt-2">
              Exotic + Domestic • Obedience • Behavioral Mod • Trick • Agility • Retrieval • Scent • Bite
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;

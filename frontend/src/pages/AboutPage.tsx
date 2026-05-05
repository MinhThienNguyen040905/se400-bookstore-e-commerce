// src/pages/AboutPage.tsx
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Rocket,
    BookOpen,
    Users,
    Library,
    Facebook,
    Twitter,
    Instagram
} from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-[#f5f8f8] text-[#111817] min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto">
                {/* Header Image */}
                <div className="@container px-4 py-5">
                    <div
                        className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[320px] md:min-h-80 relative"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop")',
                        }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="relative flex p-6 md:p-8 z-10">
                            <p className="text-white tracking-tight text-[36px] md:text-[44px] font-display font-bold leading-tight">
                                Our Story
                            </p>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <section className="px-4 py-5 max-w-4xl mx-auto">
                    <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5 text-[#2F4F4F]">
                        A Chapter in Time
                    </h2>
                    <p className="text-base font-normal leading-relaxed pb-3 pt-1 text-stone-600">
                        Founded with a passion for literature and a belief in the power of stories, BookStore-Ecommerce began as a small, local shop. Over the years, we've grown into a beloved online destination for book lovers everywhere, dedicated to connecting readers with the books that inspire, entertain, and enlighten them. Our journey is written on every page we've shared with our community.
                    </p>
                </section>

                {/* Mission & Vision Section */}
                <section className="px-4 py-5 max-w-6xl mx-auto">
                    <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-5 text-[#2F4F4F]">
                        Our Guiding Principles
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                            <h3 className="font-display text-xl font-bold mb-4 text-stone-900">Our Mission</h3>
                            <ul className="space-y-4 list-none pl-0">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To curate a diverse and inclusive collection of books that reflects the richness of human experience.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To provide a seamless and joyful online shopping experience for every customer.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To foster a vibrant community of readers through shared stories and discussions.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                            <h3 className="font-display text-xl font-bold mb-4 text-stone-900">Our Vision</h3>
                            <ul className="space-y-4 list-none pl-0">
                                <li className="flex items-start gap-3">
                                    <Rocket className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To be the world's most beloved online bookstore, known for our passion and expertise.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Rocket className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To inspire a lifelong love of reading in people of all ages and backgrounds.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Rocket className="w-6 h-6 text-[#0df2d7] mt-0.5 shrink-0" />
                                    <span className="text-stone-600">To leverage technology to make literature more accessible and engaging than ever before.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Key Statistics */}
                <section className="px-4 py-10 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                        <div className="bg-[#0df2d7]/10 p-8 rounded-xl flex flex-col items-center gap-2 border border-[#0df2d7]/20">
                            <BookOpen className="w-10 h-10 text-[#00bbb6]" />
                            <p className="text-3xl font-bold font-display text-stone-900">10,000+</p>
                            <p className="text-sm font-medium text-stone-600">Books in Collection</p>
                        </div>
                        <div className="bg-[#0df2d7]/10 p-8 rounded-xl flex flex-col items-center gap-2 border border-[#0df2d7]/20">
                            <Users className="w-10 h-10 text-[#00bbb6]" />
                            <p className="text-3xl font-bold font-display text-stone-900">5M+</p>
                            <p className="text-sm font-medium text-stone-600">Happy Customers</p>
                        </div>
                        <div className="bg-[#0df2d7]/10 p-8 rounded-xl flex flex-col items-center gap-2 border border-[#0df2d7]/20">
                            <Library className="w-10 h-10 text-[#00bbb6]" />
                            <p className="text-3xl font-bold font-display text-stone-900">50+</p>
                            <p className="text-sm font-medium text-stone-600">Curated Collections</p>
                        </div>
                    </div>
                </section>

                {/* Meet the Team Section */}
                <section className="px-4 py-5 max-w-6xl mx-auto mb-10">
                    <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.015em] pb-8 pt-5 text-center text-[#2F4F4F]">
                        The People Behind the Pages
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                        {[
                            { name: "Jane Doe", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" },
                            { name: "John Smith", role: "Head Curator", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" },
                            { name: "Emily White", role: "Community Manager", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop" }
                        ].map((person, idx) => (
                            <div key={idx} className="text-center group">
                                <div
                                    className="w-32 h-32 rounded-full mx-auto bg-cover bg-center mb-4 shadow-md border-4 border-white group-hover:border-[#0df2d7] transition-all duration-300"
                                    style={{ backgroundImage: `url("${person.img}")` }}
                                ></div>
                                <h3 className="font-display text-lg font-bold text-stone-900">{person.name}</h3>
                                <p className="text-sm text-stone-500">{person.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 py-16">
                    <div className="bg-[#0df2d7]/20 p-10 rounded-2xl text-center max-w-4xl mx-auto border border-[#0df2d7]/30">
                        <h2 className="font-display text-3xl font-bold leading-tight mb-4 text-stone-900">
                            Find Your Next Favorite Book
                        </h2>
                        <p className="mb-8 max-w-xl mx-auto text-stone-600">
                            Our shelves are filled with stories waiting to be discovered. Dive into our collection and let your next adventure begin.
                        </p>
                        <Link to="/">
                            <Button size="lg" className="bg-[#0df2d7] text-stone-900 font-bold hover:bg-[#00dcc3] px-8 h-12 text-base shadow-sm">
                                Shop Now
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
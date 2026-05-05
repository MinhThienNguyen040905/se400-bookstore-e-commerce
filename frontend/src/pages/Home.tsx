// src/pages/Home.tsx
import { useRef } from 'react';
import { Header } from '@/layouts/Header';
import { Footer } from '@/layouts/Footer';
import { BookCard } from '@/components/book/BookCard';
import { useNewReleasesBooks, useTopRatedBooks } from '@/hooks/useBooks'; // Import cả 2 hooks
import { useGenres } from '@/hooks/useGenres';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
    // Gọi 2 API riêng biệt
    const { data: newReleases, isLoading: loadingNew } = useNewReleasesBooks();
    const { data: topRatedBooks, isLoading: loadingTop } = useTopRatedBooks();

    const { data: genres = [], isLoading: loadingGenres } = useGenres();
    const navigate = useNavigate();

    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    if (loadingNew || loadingTop || loadingGenres) return <LoadingSpinner />;

    return (
        <>
            <Header />
            <main className="flex-grow bg-[#F8FAFC]">

                {/* --- HERO SECTION --- */}
                <section className="w-full">
                    <div className="relative w-full">
                        <div
                            className="flex min-h-[60vh] max-h-[720px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-4 text-center"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuARVJxaCbY0LfMOPdxEc0FnkYYUb3LvDFfgirnmv8GW9JROUc25enVUlLydSCqV0EBpQzOIiUexS3-qgFSTdEd8VmPb48l6Dw0AVcBkUiWKcXL-KJm5SDmz4lFA18ZSDhdC3kV90z3lw6VdlB0C-IOzazpgat69bRjHbmq-VNrN4tc9wt7-NC0_OmD_ypOFLyrBqHBCH0ay4O-cPr05yR41AHP3IfPRP9-1QtD7A8rEdeI7k0qf2U-X9feYJ5lPLIOtQP91iRXZhQtt")`
                            }}
                        >
                            <div className="flex flex-col gap-4 max-w-4xl">
                                <h1 className="text-white text-5xl font-display font-bold leading-tight md:text-7xl">
                                    Discover Your Next Adventure
                                </h1>
                                <p className="text-white/90 text-lg font-normal leading-normal md:text-xl">
                                    Thousands of books at your fingertips
                                </p>
                            </div>
                            <Link to="/shop">
                                <Button size="lg" className="bg-[#008080] hover:bg-[#006666] text-white font-bold px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                    Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                    {/* --- FEATURED CATEGORIES --- */}
                    <section className="mb-12">
                        <h2 className="text-[#2F4F4F] text-3xl font-bold font-display mb-8 px-2">
                            Featured Categories
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { name: "Fiction", img: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=800" },
                                { name: "Non-Fiction", img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800" },
                                { name: "Children's", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800" },
                                { name: "Sci-Fi", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" }
                            ].map((cat, idx) => (
                                <div key={idx} className="flex flex-col gap-3 group cursor-pointer">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl overflow-hidden transform group-hover:scale-105 transition-transform duration-300 shadow-md"
                                        style={{ backgroundImage: `url("${cat.img}")` }}
                                    ></div>
                                    <div className="text-center">
                                        <p className="text-[#2F4F4F] text-lg font-medium leading-normal font-display">{cat.name}</p>
                                        <p className="text-[#00796B] text-sm font-semibold">Explore</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- BROWSE ALL GENRES --- */}
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-xl font-bold text-stone-700 font-display">
                                Browse All Genres
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="p-2 rounded-full border border-stone-200 bg-white hover:bg-[#008080] hover:text-white hover:border-[#008080] transition-colors shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="p-2 rounded-full border border-stone-200 bg-white hover:bg-[#008080] hover:text-white hover:border-[#008080] transition-colors shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {genres.map((genre: any) => (
                                <div
                                    key={genre.genre_id}
                                    onClick={() => navigate(`/genre/${genre.genre_id}`, { state: { title: genre.name } })}
                                    className="snap-start flex-shrink-0 cursor-pointer group"
                                >
                                    <div className="px-6 py-3 bg-white border border-stone-200 rounded-full shadow-sm group-hover:shadow-md group-hover:border-[#008080] group-hover:bg-[#008080]/5 transition-all whitespace-nowrap">
                                        <span className="font-medium text-stone-600 group-hover:text-[#008080] text-sm">
                                            {genre.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- SECTION 1: NEW RELEASES --- */}
                    <section className="mb-16">
                        <div className="flex justify-between items-end mb-8 px-2">
                            <h2 className="text-[#2F4F4F] text-3xl font-bold font-display">
                                New Releases
                            </h2>
                            <Link to="/new-releases" className="text-[#00796B] font-medium hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {newReleases?.slice(0, 5).map((book) => (
                                <BookCard key={book.book_id} book={book} />
                            ))}
                        </div>
                    </section>

                    {/* --- SECTION 2: TOP RATED --- */}
                    <section className="mb-20">
                        <div className="flex justify-between items-end mb-8 px-2">
                            <h2 className="text-[#2F4F4F] text-3xl font-bold font-display">
                                Top Rated
                            </h2>
                            {/* Link tới trang bestsellers (vì collection 'bestsellers' đang sort theo rating) */}
                            <Link to="/bestsellers" className="text-[#00796B] font-medium hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {topRatedBooks?.slice(0, 5).map((book) => (
                                <BookCard key={book.book_id} book={book} />
                            ))}
                        </div>
                    </section>

                    {/* --- TESTIMONIALS --- */}
                    <section className="bg-white rounded-xl p-8 sm:p-12 mb-12 sm:mb-20 shadow-sm border border-gray-100">
                        <h2 className="text-[#2F4F4F] text-3xl font-bold font-display mb-8 text-center">
                            What Our Readers Say
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Sarah L.", text: "An amazing selection and fast delivery! I found exactly what I was looking for.", img: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
                                { name: "Mark T.", text: "The website is so easy to navigate. Found my new favorite author in the Bestsellers section!", img: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
                                { name: "Jessica P.", text: "Excellent customer service. I had a query about my order and they responded within hours.", img: "https://i.pravatar.cc/150?u=a04258114e29026302d" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg bg-[#E0F7FA]/30">
                                    <img src={item.img} alt={item.name} className="w-20 h-20 rounded-full mb-4 border-2 border-[#00796B]" />
                                    <p className="text-gray-600 italic mb-4">"{item.text}"</p>
                                    <p className="font-bold text-[#2F4F4F] font-display">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- NEWSLETTER --- */}
                    <section className="text-center bg-[#E0F7FA] p-8 sm:p-12 rounded-xl">
                        <h2 className="text-[#2F4F4F] text-3xl font-bold font-display mb-2">Join Our Newsletter</h2>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Subscribe for the latest updates, new arrivals, and exclusive offers delivered straight to your inbox.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="w-full flex-grow rounded-full h-12 px-5 border border-gray-300 bg-white focus:ring-2 focus:ring-[#00796B] focus:outline-none"
                                placeholder="Enter your email address"
                                type="email"
                            />
                            <button
                                className="flex items-center justify-center rounded-full h-12 px-8 bg-[#00796B] text-white font-bold hover:bg-opacity-90 transition-colors shadow-md"
                                type="submit"
                            >
                                Subscribe
                            </button>
                        </form>
                    </section>

                </div>
            </main>
            <Footer />
        </>
    );
}
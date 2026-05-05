// src/layouts/Footer.tsx
import { BookOpen, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Footer() {
    return (
        <footer className="bg-stone-50 border-t border-stone-200 mt-auto pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Col 1: Brand Info */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-[#0df2d7]" />
                            <span className="text-xl font-bold font-display text-stone-900">BookStore</span>
                        </Link>
                        <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
                            Your next chapter awaits. Discover thousands of books and join a community of readers who love stories as much as you do.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="text-stone-400 hover:text-[#00796B] transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-stone-400 hover:text-[#00796B] transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-stone-400 hover:text-[#00796B] transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Shop Links */}
                    <div>
                        <h3 className="font-bold text-stone-900 font-display mb-4 text-lg">Shop</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/new-releases" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    New Releases
                                </Link>
                            </li>
                            <li>
                                <Link to="/bestsellers" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Bestsellers
                                </Link>
                            </li>
                            <li>
                                <Link to="/categories" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link to="/deals" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Daily Deals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Help & Support */}
                    <div>
                        <h3 className="font-bold text-stone-900 font-display mb-4 text-lg">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/help" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Shipping & Returns
                                </Link>
                            </li>
                            <li>
                                <Link to="/order-tracking" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Order Tracking
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-stone-600 hover:text-[#00796B] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Contact Info */}
                    <div>
                        <h3 className="font-bold text-stone-900 font-display mb-4 text-lg">Contact</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-stone-600">
                                <MapPin className="w-5 h-5 text-[#00796B] shrink-0" />
                                <span>123 Book Street, District 1, Ho Chi Minh City, Vietnam</span>
                            </li>
                            <li className="flex items-center gap-3 text-stone-600">
                                <Phone className="w-5 h-5 text-[#00796B] shrink-0" />
                                <span>+84 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-3 text-stone-600">
                                <Mail className="w-5 h-5 text-[#00796B] shrink-0" />
                                <span>hello@bookstore.vn</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
                    <p>© 2024 BookStore-Ecommerce. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-[#00796B] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-[#00796B] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
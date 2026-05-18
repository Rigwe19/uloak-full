<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Page::updateOrCreate(
            ['slug' => '/'],
            [
                'title' => 'Home',
                'is_published' => true,
                'meta_description' => 'Uloak is the digital architecture for your heritage. Built for the diaspora to preserve what distance usually takes.',
                'content' => [
                    'hero_slides' => [
                        [
                            'id' => 'porch',
                            'title' => 'Every Family Is a Home.',
                            'subtitle' => 'Uloak is the digital architecture for your heritage. Built for the diaspora to preserve what distance usually takes.',
                            'image' => '/images/hero-1.webp',
                            'badge' => 'Step Inside',
                        ],
                        [
                            'id' => 'library',
                            'title' => 'Architecture for Memories.',
                            'subtitle' => 'Move beyond folders. Organize your legacy in rooms designed for reflection, growth, and generational continuity.',
                            'image' => '/images/hero-2.webp',
                            'badge' => 'The Library',
                        ],
                        [
                            'id' => 'heartland',
                            'title' => 'Reclaim Your Lineage.',
                            'subtitle' => 'For those navigating between worlds, Uloak provides a grounded space where your identity remains central.',
                            'image' => '/images/hero-3.webp',
                            'badge' => 'The Heartland',
                        ],
                    ],
                    'foyer' => [
                        'title_line_1' => 'Every door',
                        'title_line_2' => 'has a story.',
                        'paragraph_1' => 'Traditional archives are cold. Digital storage is fragmented. Uloak is built as a home — a place where memories are curated, not just stored.',
                        'paragraph_2' => 'For the global diaspora, heritage is often the one thing distance can quietly steal. We built the architecture to reclaim it.',
                    ],
                    'archive' => [
                        'badge' => 'The Architecture',
                        'title_1' => 'Built to last',
                        'title_2' => 'generations.',
                        'image' => '/images/about.webp',
                        'quote' => '"The house we carry within us is the only one that never crumbles."',
                        'features' => [
                            [
                                'title' => 'Intentional Capture',
                                'desc' => 'Use guided prompts to record the nuance of voice and movement, ensuring stories stay whole.',
                                'icon' => 'Play',
                            ],
                            [
                                'title' => 'Spatial Organization',
                                'desc' => 'Store legacies in "Rooms" like The Library or The Kitchen, making the archive feel human.',
                                'icon' => 'BookOpen',
                            ],
                            [
                                'title' => 'Generational Security',
                                'desc' => 'Encrypted, decentralized, and permanent. Your home is safe from time and technology shifts.',
                                'icon' => 'Shield',
                            ],
                        ],
                    ],
                    'vision' => [
                        'background' => 'https://images.unsplash.com/photo-1528605248644-14dd04cb220b?w=1600&q=80',
                        'quote_1' => '"Connecting generations across',
                        'quote_italic' => 'places, time, and distance.',
                        'quote_2' => '"',
                        'body' => 'Legacy is not a file format. It is the feeling of belonging. Uloak is the bridge between the home you remember and the home you are building.',
                    ],
                    'cta' => [
                        'badge' => 'The Best Time was Yesterday',
                        'title' => 'Begin building your digital house today',
                        'subtitle' => 'Join thousands of families preserving their heritage. Your stories deserve a place where they can live forever.',
                        'primary_btn' => 'Enter Your Home',
                        'secondary_btn' => 'Book a Legacy Film',
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/about'],
            [
                'title' => 'About Us',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'A house built for stories that matter.',
                        'subtitle' => 'Uloak is a storytelling movement based in the UK. We exist to preserve the stories that make us human — through film, technology, community, and research.',
                    ],
                    'origin' => [
                        'quote' => '"The stories we fail to capture today become the silences our grandchildren inherit tomorrow."',
                        'paragraphs' => [
                            'Uloak began from a simple, persistent question: what happens to the stories we fail to tell? Every family has an elder whose wisdom will one day be irretrievable. Every community has a history that mainstream archives overlook. Every culture carries stories that need more than a photograph and a caption to survive.',
                            'Uloak was built to answer that question — not as a product, but as a movement. We believe that storytelling is not a luxury. It is the infrastructure of identity, and it belongs to everyone.',
                            'Today, Uloak operates as a creative studio and technology company based in the UK. We produce documentary films, oral history archives, and heritage photography.',
                        ],
                    ],
                    'mission_vision' => [
                        'mission' => 'To preserve the stories that make us human — through film, archive, and technology — so that no voice is ever lost to time.',
                        'vision' => "To become the world's most trusted home for intergenerational stories — a living archive of human experience.",
                    ],
                    'founder' => [
                        'name' => 'Nnanna Adim',
                        'role' => 'Founder & Creative Director',
                        'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
                        'title' => 'Archiving the Unseen.',
                        'quote' => '"I built Uloak because I believe every person contains a world. Our job is to help that world survive."',
                        'paragraphs' => [
                            'Nnanna Adim is a documentary filmmaker, storyteller, and social entrepreneur based in the UK. He has spent his career at the intersection of creativity and community — believing that the most important stories are often the ones we assume no one wants to hear.',
                            'Uloak was born from his own experience of intergenerational disconnection and the grief of stories lost — the grandmother whose life was never documented, the family history that existed only in fading memories.',
                        ],
                    ],
                    'values' => [
                        [
                            'title' => 'Legacy & Memory',
                            'desc' => 'Stories outlive their tellers. We preserve what matters most.',
                            'icon' => 'Shield',
                        ],
                        [
                            'title' => 'Intergenerational Connection',
                            'desc' => 'Grandparents, parents, children — one unbroken thread of human experience.',
                            'icon' => 'Users',
                        ],
                        [
                            'title' => 'Authentic Storytelling',
                            'desc' => 'Every voice deserves to be heard truthfully and with dignity.',
                            'icon' => 'BookOpen',
                        ],
                        [
                            'title' => 'Community & Belonging',
                            'desc' => 'Stories are never told alone. They bind us to one another.',
                            'icon' => 'Heart',
                        ],
                        [
                            'title' => 'Cultural Dignity',
                            'desc' => 'We honour heritage, language, and identity in every story we help tell.',
                            'icon' => 'Globe',
                        ],
                    ],
                    'expressions' => [
                        [
                            'title' => 'Studio',
                            'desc' => 'The commercial arm. We produce films, photography, oral history archives, and brand storytelling.',
                            'icon' => 'Film',
                        ],
                        [
                            'title' => 'Platform',
                            'desc' => 'The technology product. A digital archive platform that allows families to preserve stories at scale.',
                            'icon' => 'Zap',
                        ],
                        [
                            'title' => 'Archive',
                            'desc' => 'The institutional expression. A curated collection of preserved life stories for research.',
                            'icon' => 'Database',
                        ],
                        [
                            'title' => 'Research',
                            'desc' => 'The academic expression. Partnerships with UK universities to study the impact of storytelling.',
                            'icon' => 'Microscope',
                        ],
                        [
                            'title' => 'Impact Events',
                            'desc' => 'The community expression. Workshops, screenings, and public programmes.',
                            'icon' => 'Users',
                        ],
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/how-it-works'],
            [
                'title' => 'How It Works',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'The Architecture of Storytelling.',
                        'subtitle' => 'From initial capture to generational preservation — a seamless journey for your legacy.',
                        'image' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1600&q=80',
                    ],
                    'steps' => [
                        [
                            'id' => '01',
                            'title' => 'The Threshold',
                            'desc' => 'Begin with a simple conversation. Whether you start with a single photo or a lifetime of memory, we provide the guided path to move inward.',
                            'icon' => 'Key',
                        ],
                        [
                            'id' => '02',
                            'title' => 'The Living Archive',
                            'desc' => 'Organize your heritage into digital rooms. The Library, The Gallery, The Kitchen — architecture that mirrors the way we actually remember.',
                            'icon' => 'LayoutGrid',
                        ],
                        [
                            'id' => '03',
                            'title' => 'The Intentional Capture',
                            'desc' => 'Use our studio services or platform tools to record stories with cinematic quality, preserving voice, movement, and nuance.',
                            'icon' => 'Camera',
                        ],
                        [
                            'id' => '04',
                            'title' => 'The Multi-Generational Home',
                            'desc' => 'Invite your lineage. Uloak is a shared space where children and grandchildren can interact with stories that would otherwise be lost.',
                            'icon' => 'Users',
                        ],
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/legacy-films'],
            [
                'title' => 'Legacy Films',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'Every life is a story worth telling.',
                        'subtitle' => 'Premium storytelling services — documentary film, oral history, heritage photography, and more. We come to you, wherever you are.',
                        'image' => 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80',
                    ],
                    'services' => [
                        [
                            'title' => 'Life Story Documentary Films',
                            'desc' => 'Cinematic documentary portraits that capture a lifetime of experiences, relationships, and wisdom. From 15-minute highlights to full-length features.',
                            'icon' => 'Film',
                        ],
                        [
                            'title' => 'Heritage Photography',
                            'desc' => 'Portrait sessions and archival photography that document people, places, and moments with intention and artistry.',
                            'icon' => 'Camera',
                        ],
                        [
                            'title' => 'Oral History Recording',
                            'desc' => 'Professionally recorded audio interviews, transcribed and archived. Perfect for families, communities, and research projects.',
                            'icon' => 'Mic',
                        ],
                        [
                            'title' => 'Memory Books & Keepsakes',
                            'desc' => 'Beautifully designed printed books combining photography, transcribed stories, and personal reflections.',
                            'icon' => 'Book',
                        ],
                        [
                            'title' => 'Brand Story Films',
                            'desc' => 'Documentary-style films for businesses, charities, and social enterprises that want to tell their story with depth and authenticity.',
                            'icon' => 'Briefcase',
                        ],
                        [
                            'title' => 'Written Life Stories',
                            'desc' => 'Ghostwritten biographical narratives crafted from interview sessions — a lasting literary portrait of a life.',
                            'icon' => 'FileText',
                        ],
                        [
                            'title' => 'Group & Community Projects',
                            'desc' => 'Multi-person documentary and archive projects for care homes, community organisations, and heritage groups.',
                            'icon' => 'Users',
                        ],
                        [
                            'title' => 'Reminiscence Sessions',
                            'desc' => 'Guided storytelling sessions designed for care home residents, using photography, music, and conversation prompts.',
                            'icon' => 'Coffee',
                        ],
                    ],
                    'steps' => [
                        [
                            'id' => '01',
                            'title' => 'Discovery Call',
                            'desc' => 'A free conversation to understand your story, your goals, and the best format for your project.',
                        ],
                        [
                            'id' => '02',
                            'title' => 'Planning & Prep',
                            'desc' => 'We design the session — questions, locations, logistics — so everything runs smoothly on the day.',
                        ],
                        [
                            'id' => '03',
                            'title' => 'The Session',
                            'desc' => 'We come to you. Relaxed, professional, and guided. No scripts. Just real conversation.',
                        ],
                        [
                            'id' => '04',
                            'title' => 'Production',
                            'desc' => 'We craft your story — editing film, designing books, or preparing your archive with care and precision.',
                        ],
                        [
                            'id' => '05',
                            'title' => 'Delivery',
                            'desc' => 'Your finished story, delivered in your chosen format. Ready to share, keep, and pass on.',
                        ],
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/community-projects'],
            [
                'title' => 'Community Projects',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'Impact through storytelling.',
                        'subtitle' => 'Uloak partners with community organizations, charities, and institutions to preserve collective memory and foster intergenerational connection.',
                    ],
                    'stats' => [
                        ['label' => 'Stories Preserved', 'value' => '1,200+'],
                        ['label' => 'Communities Served', 'value' => '45+'],
                        ['label' => 'Intergenerational Impact', 'value' => '88%'],
                    ],
                    'focus_areas' => [
                        [
                            'title' => 'Cultural Heritage',
                            'desc' => 'Preserving the unique histories and traditions of diverse communities across the UK.',
                            'icon' => 'Globe',
                        ],
                        [
                            'title' => 'Intergenerational Connection',
                            'desc' => 'Bridging the gap between elders and youth through shared narratives and workshops.',
                            'icon' => 'Users',
                        ],
                        [
                            'title' => 'Health & Wellbeing',
                            'desc' => 'Using storytelling as a tool for cognitive stimulation and social connection in care settings.',
                            'icon' => 'Heart',
                        ],
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/contact'],
            [
                'title' => 'Contact Us',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'Every conversation starts a story.',
                        'subtitle' => "Whether you're ready to book a session, want to partner with us, or simply have a question — we'd love to hear from you.",
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/privacy'],
            [
                'title' => 'Privacy Policy',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'Your stories are safe with us.',
                        'subtitle' => 'Transparency, security, and dignity are at the heart of how we handle your data.',
                    ],
                    'sections' => [
                        [
                            'title' => 'Our Commitment',
                            'content' => 'At Uloak, we understand that the stories you share with us are deeply personal. We are committed to protecting your privacy and ensuring that your data is handled with the utmost care and respect.',
                            'icon' => 'Shield',
                        ],
                        [
                            'title' => 'Data Collection',
                            'content' => 'We only collect the information necessary to provide our storytelling services. This includes contact details and the media assets you choose to archive with us.',
                            'icon' => 'Database',
                        ],
                        [
                            'title' => 'User Control',
                            'content' => 'You maintain full ownership and control over your stories. You can choose who has access to your archive and can request deletion at any time.',
                            'icon' => 'Lock',
                        ],
                    ],
                ],
            ]
        );

        Page::updateOrCreate(
            ['slug' => '/membership'],
            [
                'title' => 'Membership',
                'is_published' => true,
                'content' => [
                    'hero' => [
                        'title' => 'The digital home for your family heritage.',
                        'subtitle' => 'Join Uloak to preserve, organize, and share your family stories across generations.',
                    ],
                    'plans' => [
                        [
                            'name' => 'Founding Member',
                            'price' => '£10',
                            'interval' => 'month',
                            'desc' => 'For families who want to build their legacy with intention.',
                            'features' => [
                                'Unlimited Private Rooms',
                                '100GB Secure Storage',
                                'Collaborative Storytelling',
                                'Priority Support',
                                'Founding Member Badge',
                            ],
                            'highlight' => true,
                            'button' => 'Start Your Legacy',
                        ],
                        [
                            'name' => 'Family Explorer',
                            'price' => 'Free',
                            'interval' => 'forever',
                            'desc' => 'Begin your journey into family preservation.',
                            'features' => [
                                '1 Private Room',
                                '5GB Secure Storage',
                                'Standard Support',
                            ],
                            'highlight' => false,
                            'button' => 'Get Started',
                        ],
                    ],
                    'faqs' => [
                        [
                            'question' => 'What is Uloak Membership?',
                            'answer' => 'Uloak is a platform designed specifically for the diaspora to archive family memories in a way that feels like a home, not a hard drive.',
                        ],
                        [
                            'question' => 'Is my data secure?',
                            'answer' => 'Yes. We use enterprise-grade encryption and private architectural rooms to ensure only you and those you invite can see your stories.',
                        ],
                    ],
                ],
            ]
        );
    }
}

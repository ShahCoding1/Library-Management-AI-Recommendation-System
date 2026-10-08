from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.books.models import Author, Category, Genre, Mood, Tag, Book, Rating, Review
from apps.accounts.models import UserProfile, UserPreference
from apps.library.models import InventoryItem, Loan, Favorite, Wishlist, AuditLog
from apps.analytics.models import ReadingSession, UserStreak
from apps.recommendations.services.content_based import ContentBasedRecommender

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds realistic, academic-grade library catalog, users, ratings, and analytics data.'

    def handle(self, *args, **options):
        self.stdout.write("Starting realistic library data seeding...")

        # 1. Official Mood Profiles (Specification Section 1, 14, 87)
        moods_data = [
            ("Sad", "sad", "Melancholic, poignant, and deeply touching stories.", "#6B7280", "CloudRain"),
            ("Romantic", "romantic", "Tales of passion, love, intimate connections, and courtship.", "#EC4899", "Heart"),
            ("Historical", "historical", "Rich period narratives, ancient sagas, and real historical events.", "#D97706", "Clock"),
            ("Inspirational", "inspirational", "Uplifting works that awaken courage, purpose, and renewal.", "#F59E0B", "Sun"),
            ("Motivational", "motivational", "Action-driven stories and mindsets for personal triumph.", "#EAB308", "Zap"),
            ("Emotional", "emotional", "Profound journeys that tug at heartstrings and elicit deep tears.", "#8B5CF6", "Smile"),
            ("Happy", "happy", "Joyful, optimistic, comforting, and heartwarming narratives.", "#10B981", "Smile"),
            ("Mysterious", "mysterious", "Puzzles, enigmas, hidden secrets, and shadowy investigations.", "#6366F1", "Search"),
            ("Adventurous", "adventurous", "Daring expeditions, uncharted frontiers, and epic survival.", "#059669", "Compass"),
            ("Relaxing", "relaxing", "Calm, gentle, restorative prose for unwinding and quiet reflection.", "#06B6D4", "Coffee"),
            ("Educational", "educational", "Insightful, science-backed, and intellect-broadening topics.", "#3B82F6", "BookOpen"),
            ("Philosophical", "philosophical", "Existential inquiries, ethics, metaphysics, and the human condition.", "#4F46E5", "HelpCircle"),
            ("Dark", "dark", "Gothic, gritty, psychological tension and eerie twilight landscapes.", "#1F2937", "Moon"),
            ("Humorous", "humorous", "Witty satire, comic escapades, laughing out loud, and playful banter.", "#F97316", "Laugh"),
            ("Suspenseful", "suspenseful", "Edge-of-the-seat thrillers, ticking clocks, and escalating stakes.", "#DC2626", "AlertCircle"),
            ("Nostalgic", "nostalgic", "Yearning for yesteryears, vintage eras, childhood memories.", "#78350F", "Archive"),
            ("Hopeful", "hopeful", "Light overcoming darkness, endurance, resilience, and optimism.", "#14B8A6", "Feather"),
            ("Dramatic", "dramatic", "High-stakes conflicts, intense emotional turbulence, and revelations.", "#9333EA", "Film"),
        ]

        mood_objects = {}
        for name, slug, desc, color, icon in moods_data:
            m, _ = Mood.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc, 'color_code': color, 'icon': icon}
            )
            mood_objects[slug] = m

        # 2. Categories & Genres
        categories_data = [
            ("Fiction", "fiction", "Imaginative literary and narrative works."),
            ("Non-Fiction", "non-fiction", "Fact-based accounts, analyses, and histories."),
            ("Science & Technology", "science-technology", "Exploring cosmos, computing, and technological frontiers."),
            ("Philosophy & Mind", "philosophy-mind", "Existential thought, psychology, and ethics."),
            ("Self-Development", "self-development", "Personal mastery, leadership, and emotional intelligence."),
        ]

        cat_objs = {}
        for cname, cslug, cdesc in categories_data:
            c, _ = Category.objects.get_or_create(slug=cslug, defaults={'name': cname, 'description': cdesc})
            cat_objs[cslug] = c

        genres_data = [
            ("Science Fiction", "science-fiction", cat_objs["fiction"]),
            ("Historical Fiction", "historical-fiction", cat_objs["fiction"]),
            ("Romance", "romance", cat_objs["fiction"]),
            ("Mystery & Thriller", "mystery-thriller", cat_objs["fiction"]),
            ("Fantasy", "fantasy", cat_objs["fiction"]),
            ("Cyberpunk", "cyberpunk", cat_objs["fiction"]),
            ("Space & Astronomy", "space-astronomy", cat_objs["science-technology"]),
            ("Artificial Intelligence", "artificial-intelligence", cat_objs["science-technology"]),
            ("Stoicism & Philosophy", "stoicism-philosophy", cat_objs["philosophy-mind"]),
            ("Classic Literature", "classic-literature", cat_objs["fiction"]),
            ("Psychology", "psychology", cat_objs["philosophy-mind"]),
            ("Personal Growth", "personal-growth", cat_objs["self-development"]),
        ]

        genre_objs = {}
        for gname, gslug, gcat in genres_data:
            g, _ = Genre.objects.get_or_create(slug=gslug, defaults={'name': gname, 'category': gcat})
            genre_objs[gslug] = g

        # 3. Tags
        tags_data = [
            "Space Travel", "Artificial Intelligence", "World War II", "Dystopia",
            "Ancient Rome", "Love Story", "Detective", "Mindset", "Cosmology",
            "Resilience", "Magic", "Cyber Warfare", "Time Travel", "Leadership"
        ]
        tag_objs = {}
        for tname in tags_data:
            tslug = tname.lower().replace(" ", "-")
            t, _ = Tag.objects.get_or_create(slug=tslug, defaults={'name': tname})
            tag_objs[tslug] = t

        # 4. Authors
        authors_data = [
            ("Frank Herbert", "American science-fiction master best known for the epic Dune saga.", "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80", "American"),
            ("Jane Austen", "English novelist renowned for romantic fiction, realism, and biting social commentary.", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", "British"),
            ("George Orwell", "English novelist, essayist, and critic of totalitarianism.", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", "British"),
            ("Carl Sagan", "Celebrated astronomer, cosmologist, and Pulitzer-winning science communicator.", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", "American"),
            ("Marcus Aurelius", "Roman Emperor and revered Stoic philosopher who authored Meditations.", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", "Roman"),
            ("Virginia Woolf", "Pioneering modernist writer celebrated for non-linear stream of consciousness.", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80", "British"),
            ("Gabriel García Márquez", "Colombian master of magical realism and Nobel Laureate.", "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80", "Colombian"),
            ("Isaac Asimov", "Prolific biochemist and titan of speculative sci-fi and robotics laws.", "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80", "American"),
            ("Agatha Christie", "The Queen of Mystery and creator of Hercule Poirot and Miss Marple.", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", "British"),
            ("James Clear", "Bestselling author and habit formation and productivity researcher.", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", "American"),
        ]

        auth_objs = {}
        for aname, abio, aphoto, anationality in authors_data:
            a, _ = Author.objects.get_or_create(name=aname, defaults={
                'biography': abio, 'photo_url': aphoto, 'nationality': anationality
            })
            auth_objs[aname] = a

        # 5. Rich Books Catalog
        books_data = [
            {
                "title": "Dune",
                "subtitle": "The Epic Masterpiece of Arrakis",
                "isbn": "978-0441172719",
                "author": "Frank Herbert",
                "category": "fiction",
                "genres": ["science-fiction", "fantasy"],
                "moods": ["adventurous", "mysterious", "dramatic", "philosophical"],
                "tags": ["space-travel", "dystopia"],
                "year": 1965,
                "publisher": "Chilton Books",
                "pages": 688,
                "copies": 6,
                "cover": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80",
                "description": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness."
            },
            {
                "title": "Pride and Prejudice",
                "subtitle": "A Novel of Manners and Passion",
                "isbn": "978-0141439518",
                "author": "Jane Austen",
                "category": "fiction",
                "genres": ["romance", "historical-fiction", "classic-literature"],
                "moods": ["romantic", "humorous", "historical", "emotional"],
                "tags": ["love-story"],
                "year": 1813,
                "publisher": "T. Egerton",
                "pages": 432,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80",
                "description": "The romantic clash between Elizabeth Bennet and her arrogant suitor, Fitzwilliam Darcy, remains one of the greatest battle of wills in English literature, rich with sparkling wit and sharp social critique."
            },
            {
                "title": "1984",
                "subtitle": "Big Brother is Watching You",
                "isbn": "978-0451524935",
                "author": "George Orwell",
                "category": "fiction",
                "genres": ["science-fiction", "classic-literature"],
                "moods": ["dark", "suspenseful", "philosophical", "sad"],
                "tags": ["dystopia"],
                "year": 1949,
                "publisher": "Secker & Warburg",
                "pages": 328,
                "copies": 8,
                "cover": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=500&q=80",
                "description": "Winston Smith toils in the Ministry of Truth, rewriting history for Oceania's Ministry of Truth while harboring forbidden memories and illicit yearnings for freedom under the watchful eye of the Thought Police."
            },
            {
                "title": "Cosmos",
                "subtitle": "A Personal Voyage Through Space and Time",
                "isbn": "978-0345331359",
                "author": "Carl Sagan",
                "category": "science-technology",
                "genres": ["space-astronomy"],
                "moods": ["inspirational", "educational", "philosophical", "hopeful"],
                "tags": ["cosmology", "space-travel"],
                "year": 1980,
                "publisher": "Random House",
                "pages": 396,
                "copies": 4,
                "cover": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
                "description": "Carl Sagan's classic voyage through the cosmos traces fifteen billion years of cosmic evolution and civilization, blending science, history, and wonder in a luminous celebration of humanity's thirst for knowledge."
            },
            {
                "title": "Meditations",
                "subtitle": "Wisdom for Inner Peace and Resilience",
                "isbn": "978-0140449334",
                "author": "Marcus Aurelius",
                "category": "philosophy-mind",
                "genres": ["stoicism-philosophy", "classic-literature"],
                "moods": ["philosophical", "relaxing", "inspirational", "motivational"],
                "tags": ["ancient-rome", "resilience"],
                "year": 180,
                "publisher": "Imperial Rome",
                "pages": 256,
                "copies": 7,
                "cover": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=80",
                "description": "Written in military camps on the Danube during Roman campaigns, Marcus Aurelius's private journal reflects timeless Stoic wisdom on duty, equanimity in hardship, and harmony with nature."
            },
            {
                "title": "To the Lighthouse",
                "subtitle": "A Landmark of Stream-of-Consciousness Modernism",
                "isbn": "978-0156907392",
                "author": "Virginia Woolf",
                "category": "fiction",
                "genres": ["classic-literature"],
                "moods": ["emotional", "nostalgic", "philosophical", "sad"],
                "tags": ["resilience"],
                "year": 1927,
                "publisher": "Hogarth Press",
                "pages": 209,
                "copies": 4,
                "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80",
                "description": "Centering on the Ramsay family's summer home in the Hebrides, Woolf crafts an unforgettable study of family dynamics, loss, passage of time, and the elusive nature of art and memory."
            },
            {
                "title": "One Hundred Years of Solitude",
                "subtitle": "The Macondo Chronicle",
                "isbn": "978-0060883287",
                "author": "Gabriel García Márquez",
                "category": "fiction",
                "genres": ["fantasy", "historical-fiction", "classic-literature"],
                "moods": ["nostalgic", "dramatic", "mysterious", "emotional"],
                "tags": ["magic"],
                "year": 1967,
                "publisher": "Editorial Sudamericana",
                "pages": 448,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&q=80",
                "description": "The multi-generational saga of the Buendía family in the mythical town of Macondo, blending lyrical magical realism with profound truths of Latin American history and solitude."
            },
            {
                "title": "Foundation",
                "subtitle": "The Fall and Rise of Galactic Civilization",
                "isbn": "978-0553293357",
                "author": "Isaac Asimov",
                "category": "fiction",
                "genres": ["science-fiction"],
                "moods": ["adventurous", "educational", "philosophical", "suspenseful"],
                "tags": ["space-travel", "artificial-intelligence"],
                "year": 1951,
                "publisher": "Gnome Press",
                "pages": 255,
                "copies": 6,
                "cover": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80",
                "description": "Psychohistorian Hari Seldon foresees the inevitable collapse of the Galactic Empire and creates the Foundation at the edge of the galaxy to preserve knowledge and salvage human civilization."
            },
            {
                "title": "Murder on the Orient Express",
                "subtitle": "A Hercule Poirot Mystery",
                "isbn": "978-0062073495",
                "author": "Agatha Christie",
                "category": "fiction",
                "genres": ["mystery-thriller", "historical-fiction"],
                "moods": ["mysterious", "suspenseful", "dramatic"],
                "tags": ["detective"],
                "year": 1934,
                "publisher": "Collins Crime Club",
                "pages": 274,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=500&q=80",
                "description": "Snowed in on the luxury Orient Express, a ruthless American tycoon is murdered. Detective Hercule Poirot must interrogate twelve suspects before the killer strikes again."
            },
            {
                "title": "Atomic Habits",
                "subtitle": "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
                "isbn": "978-0735211292",
                "author": "James Clear",
                "category": "self-development",
                "genres": ["personal-growth", "psychology"],
                "moods": ["motivational", "inspirational", "educational", "hopeful"],
                "tags": ["mindset", "resilience"],
                "year": 2018,
                "publisher": "Avery",
                "pages": 320,
                "copies": 9,
                "cover": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80",
                "description": "Revolutionary behavioral framework revealing how minuscule, 1% improvements compound over time into life-altering achievements, powered by the biology and psychology of habit loops."
            },
            {
                "title": "Neuromancer",
                "subtitle": "The Cyberspace Matrix Unfolds",
                "isbn": "978-0441569595",
                "author": "Isaac Asimov", # Or William Gibson stylistic
                "category": "fiction",
                "genres": ["cyberpunk", "science-fiction"],
                "moods": ["dark", "mysterious", "suspenseful"],
                "tags": ["cyber-warfare", "artificial-intelligence", "dystopia"],
                "year": 1984,
                "publisher": "Ace",
                "pages": 271,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=80",
                "description": "Case was once the sharpest data thief in the Sprawl until rogue operators burned his nervous system. Hired for one last high-stakes digital hack, he plunges into an AI-dominated netherworld."
            },
            {
                "title": "Emma",
                "subtitle": "Handsome, Clever, and Rich",
                "isbn": "978-0141439587",
                "author": "Jane Austen",
                "category": "fiction",
                "genres": ["romance", "classic-literature"],
                "moods": ["romantic", "happy", "humorous", "relaxing"],
                "tags": ["love-story"],
                "year": 1815,
                "publisher": "John Murray",
                "pages": 474,
                "copies": 4,
                "cover": "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=500&q=80",
                "description": "Emma Woodhouse is comfortable, wealthy, and delighted to arrange the romantic affairs of her neighbors, until her misguided matchmakings force her to confront her own blind spots and affections."
            },
            {
                "title": "Animal Farm",
                "subtitle": "A Fairy Story of Power and Corruption",
                "isbn": "978-0451526342",
                "author": "George Orwell",
                "category": "fiction",
                "genres": ["classic-literature"],
                "moods": ["dark", "dramatic", "philosophical", "educational"],
                "tags": ["dystopia"],
                "year": 1945,
                "publisher": "Secker & Warburg",
                "pages": 141,
                "copies": 7,
                "cover": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80",
                "description": "A brilliant satirical fable depicting farm animals who revolt against human tyranny, only to witness their egalitarian utopian revolution subverted into an authoritarian dictatorship."
            },
            {
                "title": "And Then There Were None",
                "subtitle": "Ten Strangers, One Island, No Escape",
                "isbn": "978-0062073488",
                "author": "Agatha Christie",
                "category": "fiction",
                "genres": ["mystery-thriller"],
                "moods": ["suspenseful", "dark", "mysterious", "dramatic"],
                "tags": ["detective"],
                "year": 1939,
                "publisher": "Collins Crime Club",
                "pages": 264,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&q=80",
                "description": "Ten strangers are lured to an isolated island mansion off the Devon coast by a mysterious host, only to be executed one by one according to a grim nursery rhyme."
            },
            {
                "title": "The Pale Blue Dot",
                "subtitle": "A Vision of the Human Future in Space",
                "isbn": "978-0345376596",
                "author": "Carl Sagan",
                "category": "science-technology",
                "genres": ["space-astronomy"],
                "moods": ["inspirational", "philosophical", "hopeful", "educational"],
                "tags": ["cosmology", "space-travel"],
                "year": 1994,
                "publisher": "Random House",
                "pages": 360,
                "copies": 5,
                "cover": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&q=80",
                "description": "Inspired by the famous photograph taken by Voyager 1 looking back at Earth from 3.7 billion miles away, Sagan reflects on humility, stewardship, and our destiny among the stars."
            }
        ]

        book_objs = {}
        for bdata in books_data:
            b, created = Book.objects.get_or_create(
                isbn=bdata["isbn"],
                defaults={
                    "title": bdata["title"],
                    "subtitle": bdata["subtitle"],
                    "category": cat_objs[bdata["category"]],
                    "publication_year": bdata["year"],
                    "publisher": bdata["publisher"],
                    "page_count": bdata["pages"],
                    "total_copies": bdata["copies"],
                    "available_copies": bdata["copies"],
                    "cover_image_url": bdata["cover"],
                    "description": bdata["description"],
                    "is_active": True,
                }
            )
            # Link author
            author = auth_objs.get(bdata["author"])
            if author:
                b.authors.add(author)

            # Link genres
            for gslug in bdata["genres"]:
                if gslug in genre_objs:
                    b.genres.add(genre_objs[gslug])

            # Link moods
            for mslug in bdata["moods"]:
                if mslug in mood_objects:
                    b.moods.add(mood_objects[mslug])

            # Link tags
            for tslug in bdata["tags"]:
                if tslug in tag_objs:
                    b.tags.add(tag_objs[tslug])

            # Ensure inventory items exist
            if created or b.inventory_items.count() == 0:
                for copy_num in range(1, bdata["copies"] + 1):
                    InventoryItem.objects.create(
                        book=b,
                        copy_code=f"{b.id}-{copy_num:03d}",
                        status=InventoryItem.Status.AVAILABLE
                    )

            book_objs[b.title] = b

        # 6. Users (Admin, Librarian, Readers)
        admin_user, _ = User.objects.get_or_create(
            email='admin@library.com',
            defaults={
                'username': 'admin',
                'full_name': 'Dr. Arthur Pendelton',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin123!')
        admin_user.save()
        UserProfile.objects.get_or_create(user=admin_user, defaults={'bio': 'Chief Library Director & Systems Administrator'})
        UserStreak.objects.get_or_create(user=admin_user)

        librarian_user, _ = User.objects.get_or_create(
            email='librarian@library.com',
            defaults={
                'username': 'librarian',
                'full_name': 'Eleanor Vance',
                'role': User.Role.LIBRARIAN,
                'is_staff': True,
            }
        )
        librarian_user.set_password('Librarian123!')
        librarian_user.save()
        UserProfile.objects.get_or_create(user=librarian_user, defaults={'bio': 'Senior Cataloging Specialist & Research Archivist'})
        UserStreak.objects.get_or_create(user=librarian_user)

        reader_user, _ = User.objects.get_or_create(
            email='reader@library.com',
            defaults={
                'username': 'reader',
                'full_name': 'Julian Croft',
                'role': User.Role.READER,
            }
        )
        reader_user.set_password('Reader123!')
        reader_user.save()
        prof, _ = UserProfile.objects.get_or_create(user=reader_user, defaults={
            'bio': 'Avid speculative fiction and philosophy reader.',
            'reading_goal_minutes_per_day': 45,
            'reading_goal_books_per_month': 4
        })
        UserStreak.objects.get_or_create(user=reader_user, defaults={'current_streak': 5, 'longest_streak': 12})

        # Set user preferences for main reader
        reader_pref, _ = UserPreference.objects.get_or_create(user=reader_user)
        reader_pref.preferred_genres.set([genre_objs["science-fiction"], genre_objs["stoicism-philosophy"]])
        reader_pref.preferred_moods.set([mood_objects["philosophical"], mood_objects["adventurous"], mood_objects["inspirational"]])
        reader_pref.onboarding_completed = True
        reader_pref.save()

        # Additional community users for collaborative filtering diversity
        demo_readers = [
            ("alex@library.com", "Alex Mercer", ["science-fiction", "cyberpunk"], ["dark", "suspenseful"]),
            ("sarah@library.com", "Sarah Jenkins", ["romance", "historical-fiction"], ["romantic", "emotional"]),
            ("emma@library.com", "Emma Watson", ["classic-literature", "personal-growth"], ["inspirational", "motivational"]),
        ]
        created_readers = [reader_user]
        for remail, rname, rgenres, rmoods in demo_readers:
            u, _ = User.objects.get_or_create(email=remail, defaults={'username': remail.split('@')[0], 'full_name': rname, 'role': User.Role.READER})
            u.set_password('Reader123!')
            u.save()
            UserProfile.objects.get_or_create(user=u, defaults={'bio': f"Reader interested in {', '.join(rgenres)}."})
            UserStreak.objects.get_or_create(user=u, defaults={'current_streak': 3, 'longest_streak': 7})
            up, _ = UserPreference.objects.get_or_create(user=u)
            up.preferred_genres.set([genre_objs[g] for g in rgenres if g in genre_objs])
            up.preferred_moods.set([mood_objects[m] for m in rmoods if m in mood_objects])
            up.onboarding_completed = True
            up.save()
            created_readers.append(u)

        # 7. Interaction Seeds (Ratings, Loans, Favorites, Wishlists)
        # Main reader interactions
        dune = book_objs.get("Dune")
        meditations = book_objs.get("Meditations")
        pride = book_objs.get("Pride and Prejudice")
        cosmos = book_objs.get("Cosmos")
        habits = book_objs.get("Atomic Habits")
        orwell_1984 = book_objs.get("1984")

        if dune:
            Rating.objects.get_or_create(user=reader_user, book=dune, defaults={'score': 5})
            Favorite.objects.get_or_create(user=reader_user, book=dune)
            Review.objects.get_or_create(
                user=reader_user, book=dune,
                defaults={'content': "A breathtaking epic of ecology, philosophy, and religion. Unmatched scope!"}
            )

        if meditations:
            Rating.objects.get_or_create(user=reader_user, book=meditations, defaults={'score': 5})
            Favorite.objects.get_or_create(user=reader_user, book=meditations)

        if pride:
            Rating.objects.get_or_create(user=reader_user, book=pride, defaults={'score': 4})
            Wishlist.objects.get_or_create(user=reader_user, book=pride)

        if cosmos:
            Rating.objects.get_or_create(user=reader_user, book=cosmos, defaults={'score': 5})

        # Alex's interactions (Sci-Fi / Cyberpunk lover)
        alex_user = created_readers[1]
        if dune:
            Rating.objects.get_or_create(user=alex_user, book=dune, defaults={'score': 5})
        neuromancer = book_objs.get("Neuromancer")
        if neuromancer:
            Rating.objects.get_or_create(user=alex_user, book=neuromancer, defaults={'score': 5})
            Favorite.objects.get_or_create(user=alex_user, book=neuromancer)
        foundation = book_objs.get("Foundation")
        if foundation:
            Rating.objects.get_or_create(user=alex_user, book=foundation, defaults={'score': 4})

        # Sarah's interactions (Romance / Mystery)
        sarah_user = created_readers[2]
        if pride:
            Rating.objects.get_or_create(user=sarah_user, book=pride, defaults={'score': 5})
            Favorite.objects.get_or_create(user=sarah_user, book=pride)
        emma_book = book_objs.get("Emma")
        if emma_book:
            Rating.objects.get_or_create(user=sarah_user, book=emma_book, defaults={'score': 5})
        murder = book_objs.get("Murder on the Orient Express")
        if murder:
            Rating.objects.get_or_create(user=sarah_user, book=murder, defaults={'score': 4})

        # Emma's interactions (Self-Dev / Habits / Classics)
        emma_user = created_readers[3]
        if habits:
            Rating.objects.get_or_create(user=emma_user, book=habits, defaults={'score': 5})
            Favorite.objects.get_or_create(user=emma_user, book=habits)
        if meditations:
            Rating.objects.get_or_create(user=emma_user, book=meditations, defaults={'score': 5})

        # 8. Active and Returned Loans
        now = timezone.now()
        if dune:
            loan_item = dune.inventory_items.filter(status=InventoryItem.Status.AVAILABLE).first()
            if loan_item:
                loan_item.status = InventoryItem.Status.BORROWED
                loan_item.save()
                dune.available_copies = max(0, dune.available_copies - 1)
                dune.save()
                Loan.objects.get_or_create(
                    user=reader_user, book=dune, inventory_item=loan_item,
                    defaults={'issue_date': now - timedelta(days=4), 'due_date': now + timedelta(days=10), 'status': Loan.Status.ACTIVE}
                )

        if orwell_1984:
            # Overdue loan example
            loan_item = orwell_1984.inventory_items.filter(status=InventoryItem.Status.AVAILABLE).first()
            if loan_item:
                loan_item.status = InventoryItem.Status.BORROWED
                loan_item.save()
                orwell_1984.available_copies = max(0, orwell_1984.available_copies - 1)
                orwell_1984.save()
                Loan.objects.get_or_create(
                    user=reader_user, book=orwell_1984, inventory_item=loan_item,
                    defaults={'issue_date': now - timedelta(days=20), 'due_date': now - timedelta(days=6), 'status': Loan.Status.ACTIVE}
                )

        if cosmos:
            # Past returned loan
            loan_item = cosmos.inventory_items.first()
            Loan.objects.get_or_create(
                user=reader_user, book=cosmos, inventory_item=loan_item,
                defaults={'issue_date': now - timedelta(days=35), 'due_date': now - timedelta(days=21), 'return_date': now - timedelta(days=22), 'status': Loan.Status.RETURNED}
            )

        # 9. Realistic Reading Sessions for Screen-Time Analytics
        past_session_days = [0, 1, 2, 3, 4, 5, 6]
        durations_sec = [2400, 3600, 1800, 4200, 2700, 3100, 2900]
        for day_offset, dur in zip(past_session_days, durations_sec):
            sess_time = now - timedelta(days=day_offset, hours=2)
            ReadingSession.objects.create(
                user=reader_user,
                book=dune,
                started_at=sess_time,
                ended_at=sess_time + timedelta(seconds=dur),
                duration_seconds=dur,
                pages_read=int(dur / 60),
                is_completed=True,
                source='WEB'
            )

        # Refresh book rating statistics
        for b in Book.objects.all():
            b.update_rating_statistics()

        # 10. Prime Content-Based Recommender Artifacts
        self.stdout.write("Building initial Content-Based TF-IDF models...")
        recommender = ContentBasedRecommender()
        recommender.build_model()

        self.stdout.write(self.style.SUCCESS(
            "Library database successfully seeded with 18 Moods, 12 Genres, 15 Master Books, "
            "and realistic Users (Admin: admin@library.com, Reader: reader@library.com [Password: Reader123!])."
        ))

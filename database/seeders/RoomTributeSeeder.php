<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomTributeSeeder extends Seeder
{
    public function run(): void
    {
        $room = Room::where('slug', 'apoemn-memorial')->first();

        if (! $room) {
            $room = Room::first();
        }

        $tributes = [
            [
                'name' => 'Just Weddings',
                'relationship' => 'APPOEMN Colleague',
                'message' => "MRS K!\n\nTruly an amazing soul. I'm really tired of all that's going on with sickness.\n\nShe gave Appoemn her all, and I will forever be grateful to Mrs K. She believed in the Appoemn dream even when it looked like a joke. So many meetings we had, all over the place, back then. We didn't know each other yet, but the drive and passion bonded us together.\n\nWe had our little arguments, but it was always out of love. She truly cared about Appoemn and the event industry as a whole. She was extremely passionate about Appoemn.\n\nMy favorite memory of her is our back-to-school theme party. She was so excited to represent and wear her secondary school uniform. That night with her was pure fun and pure Mrs K.\n\nSo we need to be strong for her and make sure all our work on Appoemn never goes in vain. We also need to send her forth in the most beautiful and stylish way that represents her.\n\nSleep well, my darling Mrs K. Love you always.\n\nOne thing I'm happy about: I let her know how much I appreciated her while she was alive. That brings me a bit of peace. Hummm still will miss her Sha!",
                'is_approved' => true,
            ],
            [
                'name' => 'Styled by Berry',
                'relationship' => 'APPOEMN Colleague',
                'message' => "I've been in denial since I read this.\n\nMrs K!!! Very Straight to the point, result driven, her strength was strengthening.\n\nTalking about her in past tense still seems unreal.\n\nYou will be greatly missed, thank you for standing for the truth, thank you for giving your heart to serving others, thank you for the encouragement, the love and warmth you showed when we joined APPOEMN.\n\nMay the Lord Comfort your entire family at this time and this industry with whom you gave your heart to.\n\nSleep on Mrs K, Heaven gain a Remarkable Soul.",
                'is_approved' => true,
            ],
            [
                'name' => 'TPl. Soledotun Abdulkarim-Yusuf',
                'relationship' => 'La Dots Partycity',
                'message' => "Today, my heart is heavy with grief as I struggle to come to terms with the shocking loss of a truly remarkable woman Mrs. Adefunke Kuyoro, CEO of TWC Events.\n\nShe was more than a professional in the events industry; she was excellence personified. She carried her work with grace, creativity, and a standard that inspired everyone around her.\n\nBut beyond her work, she was so much more to me, a friend, a sister, a confidant. Her warmth, kindness, and genuine spirit made her easy to love and impossible to forget.\n\nMrs K, your presence was a gift to us all. Your legacy will live on in the lives you touched, the beauty you created, and the love you gave so freely.\n\nRest well, dear sister. You will be sorely missed, but never forgotten.",
                'is_approved' => true,
            ],
            [
                'name' => 'Dunamis Events',
                'relationship' => 'APPOEMN Colleague',
                'message' => "My Momma Kay Mrs. Adefunke Kuyoro, you came, you impacted our world & finished strong!\n\nIkú, oró re dà!? Isà òkú, ìségun re dà!?\n\nWe celebrate the gift of YOU to our world. Akoni Obìnrin! An iconic Amazon you were indeed one who loved without disparity, one who was fair to all, a support structure from sun up to sun down.\n\nYour passion for APPOEMN and the industry was palpable and so contagious.\n\nSalute to a woman of grace, virtue & principle....one I was privileged to have shared in her life, my predecessor, my momma-fix-all.\n\nAdieu! You finished strong Momma Kay, now rest!",
                'is_approved' => true,
            ],
            [
                'name' => 'Pryhmshift Events',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Jesus Christ.\n\nMrs K.\n\nOne of the most pleasant personality I met when I joined the association.\n\nMay your sweet soul rest in perfect peace, but this is hard to swallow.",
                'is_approved' => true,
            ],
            [
                'name' => 'Fruitieworld',
                'relationship' => 'APPOEMN Colleague',
                'message' => "I don't even know where to start.\n\nMrs K was my first contact in APPOEMN. She held my hand, she encouraged, She guided me. She would personally call me back then. Can still hear her voice in my head with a subtle but firm and sincere voice.\n\nShe was there, she was present, she was concerned.\n\nThank you for all you've done, Mrs K. You will be fondly remembered and greatly missed. You fought the fight, and for me, you won cos you loved God.\n\nI love you, but God loves you more. Rest well and easy. You are in a better place now.\n\nGod grant her family the fortitude to bear this great loss.",
                'is_approved' => true,
            ],
            [
                'name' => 'Courage Events',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Farewell Mrs k. You held every of your appointments close to heart. You left a mark everywhere you served. Your footprints are all over and wouldn't be erased easily even long after you have gone.\n\nThanks for those spaces you introduced me to, and some am still serving them.\n\nMrs. k, you truly lived, enjoyed, and gave the best part of your life to the service of mankind and I am grateful that your eyes did not see corruption.\n\nContinue with the angels until we meet to part no more. Adieu Snr Funke.",
                'is_approved' => true,
            ],
            [
                'name' => 'Drinks Option',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Mrs K. So I won't hear you again \"Mr. Adedokun, ẹ ma worry, mo ma to de, once I am back, I will collect my honey and Ọfada. Eyiti ẹ fun koi tan\" this was early March or late Feb, oh my world. You made my membership of this beautiful association worthwhile.\n\nSunre o, mama.",
                'is_approved' => true,
            ],
            [
                'name' => 'Dunnice Catering',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Mrs. K,\n\nI knew you before APPOEMN—as a woman who sincerely loved God and people, firm in faith yet gentle and loving in spirit.\n\nMay the Lord Himself surround her family and the entire association with His peace, comfort, and strength during this season.\n\nRIP Mrs K",
                'is_approved' => true,
            ],
            [
                'name' => 'Mrs Abidemi Adeyemi',
                'relationship' => 'Southwest Regional Leader, APPOEMN',
                'message' => "The passing of the late Mrs Funke Kuyoro, a former President of APPOEMN deeply saddens us!\n\nHer visionary leadership, dedication, and service laid a strong foundation for the growth of our association. She was not only a distinguished leader but also a mentor and inspiration to many.\n\nOn behalf of the executives and all members of the APPOEMN Southwest region, we extend our heartfelt condolences.\n\nMay her soul rest in perfect peace.",
                'is_approved' => true,
            ],
            [
                'name' => 'Remol Event Managers',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Tribute to Mrs. K\n\nMrs. K was more than my senior in high school; she was a dear friend, mentor, and an exceptional force in the event industry. Kind, dependable, loyal, and selfless, she blessed me with her friendship and touched countless lives.\n\nHer passing is deeply painful and difficult to accept. The industry has lost a professional, but I have lost a cherished friend.\n\nThank you, Mrs. K, for your friendship, support, and the impact you made on so many lives.\n\nRest in peace, Mrs. K. You will be greatly missed.",
                'is_approved' => true,
            ],
            [
                'name' => 'Oaken Events',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Our dearest Mrs K,\n\nTears in my eyes as I write this to you. You fought so hard. We had complete faith in God for a turnaround. God always knows best.\n\nThank you for being so passionate about Appoemn and the event industry as a whole.\n\nThank you for always being so supportive and loving towards me. I appreciate the calls you made at different times to keep me going.\n\nThankful to God for your life always. Have no doubt you are in a better place.\n\nLove you now and always.",
                'is_approved' => true,
            ],
            [
                'name' => 'Bose Arisagbola',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Words fail me. Mrs K was an ever ready soldier, commandant, leader, mentor, supporter, raising the bar. She ignited the spirit that connected us strongly with a bond so deep it made us family.\n\nMy Mrs K could listen, show care and compassion, she loves fearlessly and gives her best always. Her truth was her badge of honor.\n\nA - Audacious\nD - Diligent\nE - Energetic\nF - Fun & Friendly\nU - Unshakable\nN - No-nonsense\nK - Kind\nE - Exceptional\n\nI truly LOVE you MRS ADEFUNKE ADETEJU KUYORO.",
                'is_approved' => true,
            ],
            [
                'name' => 'IK',
                'relationship' => 'APPOEMN Colleague',
                'message' => "Mama you are greatly celebrated… greatly loved.\n\nYour time on earth was impactful.\n\nYou were a mother, leader, sister, friend, mentor, and more.\n\nYou gave your all.\n\nSleep well Mama.",
                'is_approved' => true,
            ],
            [
                'name' => 'Lara Adelusi',
                'relationship' => 'Sheba Centre',
                'message' => "My heart has been so heavy Aunty. Aso bayi. I got your canadian number on Monday June 1, from Mrs O and was to call you as soon as I landed. My plan was to call you today and come visit, then on opening facebook I got the shock of my life.\n\nI have been disoriented, can't get myself together. You were graceful, professional, loyal, supportive and loving.\n\nYou came all the way to Ibadan for my brother's wedding. Haaa, my big Sis, e leyi dun mi ooo. Your wisdom and counsel is priceless. Thank you for all the lives you touched. We miss you dearly.",
                'is_approved' => true,
            ],
        ];

        foreach ($tributes as $tribute) {
            $room->tributes()->create(array_merge($tribute, [
                'created_at' => now()->subDays(rand(1, 10)),
                'updated_at' => now(),
            ]));
        }
    }
}

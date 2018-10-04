(function () {
    'use strict'

    var gameController = {
        init: function (fullInit) {
            //Initialize the game state
            gameData.guesses = [];
            gameData.doomCounter = 0;
            gameData.maskedName = "";
            gameData.selectedOldOne = null;

            // if a full reset is requested zero out the game history too.
            if (fullInit) {
                gameData.wins = 0;
                gameData.losses = 0;
                gameData.lastOldOneIndex = -1;
                uiController.updateMessage(gameData.initialMessage, gameData.instructions);
                uiController.showGameArea(false);
            }

            uiController.updateWinsCounter(gameData.wins);
            uiController.updateLossesCounter(gameData.losses);
        },

        onKeyUp: function (event) {
            var key = event.key.toUpperCase();

            // generate an alphabet array if it is not already there.
            if (!gameData.alphabetArray) {
                gameData.alphabetArray = gameController.genAlphabet();
            }

            // Check for valid keystrokes using the alpha array.
            if (gameData.alphabetArray.indexOf(key) == -1) {
                uiController.updateMessage("Invalid Guess", "Please guess a letter. Quickly, before doom comes to us all!!!");
                return;
            }

            // We got a valid key, update the game state
            gameController.updateGameState(key);
        },

        updateGameState: function (guess) {
            // If the doom counter is <= 0 start the round.
            if (gameData.doomCounter <= 0) {
                gameData.doomCounter = 15;
                gameData.selectedOldOne = this.getGreatOldOne();
                uiController.toggleInfoCards(false);
                uiController.showGameArea(true);
            } else {
                if (gameData.guesses.indexOf(guess) === -1) {
                    gameData.guesses.push(guess);

                    if (gameData.selectedOldOne.name.toUpperCase().indexOf(guess) !== -1) {
                        uiController.updateMessage("The Darkness Lessens", "You breathe a sigh of relief as another piece of the mystery is revealed. There is yet hope!");
                    } else {
                        uiController.updateMessage("The Shadows Swirl", "The mystery remains impenetrable, and the remaining time we have becomes ever more finite...");
                    };
                } else {
                    uiController.updateMessage("You Lost in the Mist", "Please guess a new letter! We are running out of time!");
                }
            }

            gameData.doomCounter--;
            gameData.maskedName = this.genMaskedName();
            uiController.updateMaskedName(gameData.maskedName);
            uiController.updateGuesses(gameData.guesses.join(", "));
            uiController.updateDoomCounter(gameData.doomCounter);

            // for debugging
            this.logState();

            // If there are no more underscores in the masked name the Great Old One has been discovered
            if (gameData.maskedName.indexOf("_") === -1) {
                this.finalizeGame(true);
                return
            }

            // If the doom counter reaches zero the Great Old One is victorious.
            if (gameData.doomCounter === 0) {
                this.finalizeGame(false);
            }
        },

        finalizeGame: function (victory) {
            if (victory) {
                gameData.wins++;
                uiController.updateMessage("Victory!", "You have discovered the Great Old One before it could fully enter our world and reduce us all to ash! Press any key to challenge another Great Old One.")
            } else {
                gameData.losses++;
                uiController.updateMessage("Failure!", "The Great Old One has entered our world and begun laying waste to the land scape...  Press any key to challenge another Great Old One.")
            }

            // show the Old One's info card
            uiController.toggleInfoCards(true);

            // Complete the game.
            // 1. Tally scores
            // 2. Register the last old one so we don't repeat twice in a row.
            // Reset the data.
            gameController.init();
            uiController.updateDoomCounter(gameData.doomCounter);
        },

        logState: function (key) {
            console.log("------------------------------------------------");
            console.log(key);
            console.log(gameData.guesses);
            console.log(gameData.maskedName);
            console.log(gameData.selectedOldOne.name)
            console.log(gameData.doomCounter);
        },

        genAlphabet: function () {
            var alph = [];

            for (var i = 65; i < 91; i++) {
                alph.push(String.fromCharCode(i).toUpperCase());
            }

            return alph;
        },

        genMaskedName: function () {
            var maskedName = "";
            for (var i = 0; i < gameData.selectedOldOne.name.length; i++) {
                var char = gameData.selectedOldOne.name.charAt(i);
                if (char === "-" || char === " " || gameData.guesses.indexOf(char.toUpperCase()) > -1) {
                    maskedName = maskedName + char;
                } else {
                    maskedName = maskedName + "_";
                }

            }
            return maskedName;
        },

        getGreatOldOne: function () {
            // Get a random index from the greatOldOnes array.
            var index = Math.floor(Math.random() * gameData.greatOldOnes.length);

            // If it is not the same as the last chosen Great Old One then return the object from the array.
            if (gameData.lastOldOneIndex != index) {
                return gameData.greatOldOnes[index];
            } else {
                return this.getGreatOldOne();
            }
        }
    };

    var uiController = {
        elements: {
            doomCounter: document.getElementById("doom-counter"),
            gameCard: document.getElementById("play-area-card"),
            greatOldOneName: document.getElementById("great-old-one-name"),
            greatOldOneTitle: document.getElementById("great-old-one-title"),
            greatOldOneText: document.getElementById("great-old-one-text"),
            guesses: document.getElementById("guesses"),
            infoCard: document.getElementById("info-card"),
            lossesCounter: document.getElementById("losses-counter"),
            maskedName: document.getElementById("masked-name"),
            messageHeader: document.getElementById("message-header"),
            messageText: document.getElementById("message-text"),
            winsCounter: document.getElementById("wins-counter")
        },

        showGameArea: function (show) {
            document.querySelectorAll(".game-area").forEach(element => {
                if (show) {
                    element.classList.remove("hidden");
                } else {
                    element.classList.add("hidden");
                }
            });
        },

        toggleInfoCards: function(showinfoCard) {
            if(showinfoCard) {
                this.elements.gameCard.classList.add("hidden");
                this.elements.infoCard.classList.remove("hidden");
            } else {
                this.elements.infoCard.classList.add("hidden");
                this.elements.gameCard.classList.remove("hidden");
            }
        },

        updateInfoCard: function(greatOldOne) {
            this.elements.greatOldOneName.textContent = greatOldOne.name;
            this.elements.greatOldOneNamtitle.textContent = greatOldOne.title;
            this.elements.greatOldOneText.textContent = greatOldOne.text;
        },

        updateGuesses: function (value) {
            this.elements.guesses.textContent = value;
        },

        updateDoomCounter: function (value) {
            this.elements.doomCounter.textContent = value;
        },

        updateLossesCounter: function (value) {
            this.elements.lossesCounter.textContent = value;
        },

        updateMaskedName: function (value) {
            this.elements.maskedName.textContent = value;
        },

        updateMessage: function (headerValue, textValue) {
            this.elements.messageHeader.textContent = headerValue;
            this.elements.messageText.textContent = textValue;
        },

        updateWinsCounter: function (value) {
            this.elements.winsCounter.textContent = value;
        }
    };

    var gameData = {
        alphabetArray: null,
        gameInProgress: false,
        wins: 0,
        losses: 0,
        doomCounter: 0,
        guesses: [],
        maskedName: "",
        selectedOldOne: null,
        lastOldOneIndex: -1,
        initialMessage: "Press any key to face the Great Old One!",
        instructions: "If you can discover the name of the approaching old one before he arrives, he will be prevented from entering our world. If you fail, humanity will face an eternity of terror and insanity under his rule! You guess the letters of his name by entering letters on the keyboard. If they are in the Great Old One's name they will be revealed. If they are not in it's name they will be displayed in the previous guesses section below the name. Each guess will cause the Doom Counter to tick down. When it reaches zero the Great Old One has arrived bring doom upon us all! Good luck!",

        greatOldOnes: [
            {
                name: "Abhoth",
                title: "The Source of Uncleanliness",
                text: "He described a sort of pool with a margin of mud that was marled with obscene offal; and in the pool a grayish, horrid mass that nearly choked it from rim to rim... Here, it seemed, was the ultimate source of all miscreation and abomination. For the gray mass quobbed and quivered, and swelled perpetually; and from it, in manifold fission, were spawned the anatomies that crept away on every side through the grotto. There were things like bodiless legs or arms that flailed in the slime, or heads that rolled, or floundering bellies with fishes' fins; and all manner of things malformed and monstrous, that grew in size as they departed from the neighborhood of Abhoth. And those that swam not swiftly ashore when they fell into the pool from Abhoth, were devoured by mouths that gaped in the parent bulk. "
            },

            {
                name: "Azathoth",
                title: "The Blind Idiot God",
                text: "Outside the ordered universe that amorphous blight of nethermost confusion which blasphemes and bubbles at the center of all infinity—the boundless daemon sultan Azathoth, whose name no lips dare speak aloud, and who gnaws hungrily in inconceivable, unlighted chambers beyond time and space amidst the muffled, maddening beating of vile drums and the thin monotonous whine of accursed flutes."
            },

            {
                name: "Bokrug",
                title: "The Great Water Lizard",
                text: "But half buried in the rushes was spied a curious green idol of stone; an exceedingly ancient idol coated with seaweed and chiselled in the likeness of Bokrug, the great water-lizard. That idol, enshrined in the high temple at Ilarnek, was subsequently worshipped beneath the gibbous moon throughout the land of Mnar."
            },

            {
                name: "Byatis",
                title: "The Berkeley Toad",
                text: "Byatis, the serpent-bearded, the god of forgetfulness, came with the Great Old Ones from the stars, called by obeisances made to his image, which was brought by the Deep Ones to Earth. He may be called by the touching of his image by a living being. His gaze brings darkness on the mind; and it is said that those who look upon his eye will be forced to walk into his clutches. He feasts upon those who stray to him, and from those upon whom he feasts he draws a part of their vitality."
            },

            {
                name: "Chaugnar Faugn",
                title: "The Feeder",
                text: "Some were the figures of well-known myth—gorgons, chimaeras, dragons, cyclops, and all their shuddersome congeners. Others were drawn from darker and more furtively whispered cycles of subterranean legend—black, formless Tsathoggua, many-tentacled Cthulhu, proboscidian Chaugnar Faugn, and other rumoured blasphemies from forbidden books like the Necronomicon, the Book of Eibon, or the Unaussprechlichen Kulten of von Junzt."
            },

            {
                name: "Cthugha",
                title: "The Living Flame",
                text: "He hung motionless in a black, forbidding sky and at first thought he was suspended somewhere in the intrasolar deeps much closer to the Sun than on Earth. But then he realized that the dully gleaming orb which floated before his dreaming vision was not the Sun. Ugly dark blotches mottled the dull orange surface and great columns of spinning flame arced around the rim.... [He watched] the titan sunspots drift slowly across the hideous disc, at times growing larger and merging into great gaping chasms in the fiery atmosphere, while at others dwindling almost to nothingness.... Something was stirring deep within that fiery atmosphere; something monstrous that roared an insatiable anger against the chains of the Elder Gods which had bound it there for an eternity.... Unable to resist, utterly powerless to control his movements, he was diving headlong towards that ravening chaos, that age-old intelligence which was Cthugha."
            },

            {
                name: "Cthulhu",
                title: "The Great Dreamer",
                text: "They were not composed altogether of flesh and blood. They had shape [...] but that shape was not made of matter. When the stars were right, They could plunge from world to world through the sky; but when the stars were wrong, They could not live. But although They no longer lived, They would never really die. They all lay in stone houses in Their great city of R'lyeh, preserved by the spells of mighty Cthulhu for a glorious resurrection when the stars and the earth might once more be ready for Them."
            },

            {
                name: "Dagon",
                title: "Father Dagon, the Fish God",
                text: "Vast, Polyphemus-like, and loathsome, it darted like a stupendous monster of nightmares to the monolith, about which it flung its gigantic scaly arms, the while it bowed its hideous head and gave vent to certain measured sounds..."
            },

            {
                name: "Gol-goroth",
                title: "God of the Black Stone",
                text: "In the center of the chamber stood a grim, black altar; it had been rubbed all over with a sort of phosphorous, so that it glowed dully, lending a semi-illumination to the shadowy cavern. Towering behind it on a pedestal of human skulls, lay a cryptic black object, carven with mysterious hieroglyphics. The Black Stone! The ancient, ancient Stone before which, the Britons said, the Children of the Night bowed in gruesome worship, and whose origin was lost in the black mists of a hideously distant past. Once, legend said, it had stood in that grim circle of monoliths called Stonehenge, before its votaries had been driven like chaff before the bows of the Picts."
            },

            {
                name: "Hastur",
                title: "The King in Yellow",
                text: "I found myself faced by names and terms that I had heard elsewhere in the most hideous of connexions—Yuggoth, Great Cthulhu, Tsathoggua, Yog-Sothoth, R’lyeh, Nyarlathotep, Azathoth, Hastur, Yian, Leng, the Lake of Hali, Bethmoora, the Yellow Sign, L’mur-Kathulos, Bran, and the Magnum Innominandum—and was drawn back through nameless aeons and inconceivable dimensions to worlds of elder, outer entity at which the crazed author of the Necronomicon had only guessed in the vaguest way... There is a whole secret cult of evil men (a man of your mystical erudition will understand me when I link them with Hastur and the Yellow Sign) devoted to the purpose of tracking them down and injuring them on behalf of the monstrous powers from other dimensions."
            },

            {
                name: "Ithaqua",
                title: "The Wind-Walker",
                text: "The stars had been blotted out…the great cloud which had obscured the sky looked curiously like the outline of a great man. And…where the top of the ‘cloud’ must have been, where the thing should have been, there were two gleaming stars, visible despite the shadow, two gleaming stars, burning bright–like eyes!"
            },

            {
                name: "Nyarlathotep",
                text: "And it was then that Nyarlathotep came out of Egypt. Who he was, none could tell, but he was of the old native blood and looked like a Pharaoh. The fellahin knelt when they saw him, yet could not say why. He said he had risen up out of the blackness of twenty-seven centuries, and that he had heard messages from places not on this planet. Into the lands of civilisation came Nyarlathotep, swarthy, slender, and sinister, always buying strange instruments of glass and metal and combining them into instruments yet stranger. He spoke much of the sciences—of electricity and psychology—and gave exhibitions of power which sent his spectators away speechless, yet which swelled his fame to exceeding magnitude. Men advised one another to see Nyarlathotep, and shuddered. And where Nyarlathotep went, rest vanished; for the small hours were rent with the screams of a nightmare."
            },

            {
                name: "Nyogtha",
                title: "Dweller in Darkness",
                text: "Men knew him as the Dweller in Darkness, that brother of the Old Ones called Nyogtha, the Thing that should not be. He can be summoned to Earth's surface through certain secret caverns and fissures, and sorcerers have seen him in Syria and below the black tower of Leng; from the Thang Grotto of Tartary he has come ravening to bring terror and destruction among the pavilions of the great Khan. Only by the looped cross, by the Vach-Viraj incantation and by the Tikkoun elixir may he be driven back to the nighted caverns of hidden foulness where he dwelleth."
            },

            {
                name: "Shub-Niggurath",
                title: "The Black Goat of the Woods",
                text: "Ever Their praises, and abundance to the Black Goat of the Woods. Iä! Shub-Niggurath! Iä! Shub-Niggurath! The Black Goat of the Woods with a Thousand Young, the All-Mother and wife of the Not-to-Be-Named-One!"
            },

            {
                name: "Tsathoggua",
                title: "The Sleeper of N'kai",
                text: "[In] that secret cave in the bowels of Voormithadreth... abides from eldermost eons the god Tsathoggua. You shall know Tsathoggua by his great girth and his batlike furriness and the look of a sleepy black toad which he has eternally. He will rise not from his place, even in the ravening of hunger, but will wait in divine slothfulness for the sacrifice."
            },

            {
                name: "Yog-Sothoth",
                title: "Lurker at the Threshold",
                text: "Yog-Sothoth knows the gate. Yog-Sothoth is the gate. Yog-Sothoth is the key and guardian of the gate. Past, present, future, all are one in Yog-Sothoth. He knows where the Old Ones broke through of old, and where They shall break through again. He knows where They have trod earth's fields, and where They still tread them, and why no one can behold Them as They tread."
            }
        ]

    };


    gameController.init(true);
    document.addEventListener("keyup", gameController.onKeyUp);
})();
class flood {

    constructor() {        
        this.game = {
            grid: {
                node: null,
                size: null,
                matrix: null,
            },
            message: {
                node: null,
                time: null,
                date: null,
            },
            node: null,
        }

        this.game.grid.size = 10;
        this.game.grid.matrix = Array.from({ length: this.game.grid.size }, () => Array(this.game.grid.size).fill(null));

        this.colorMapping = {
            ":red_square:": "🟥",
            ":orange_square:": "🟧",
            ":yellow_square:": "🟨",
            ":green_square:": "🟩",
            ":blue_square:": "🟦",
            ":purple_square:": "🟪",
            ":brown_square:": "🟫"
        }

        this.playGame();
    }

    floodGameOpen() {
        const possibleGames = document.querySelectorAll('div[class^="grid__623de"]');

        if (!possibleGames) {
            console.log('No possible games found (no divs with class "grid__623de" found).');
            return false;
        }

        for (let i = 0; i < possibleGames.length; i++) {
            this.game.grid.node = possibleGames[i].querySelector('div[class^="embedFieldValue__623de"]')
            if (this.game.grid.node) {
                this.img = this.game.grid.node.querySelectorAll('img[class^="emoji"]');
            } else {
                this.img = null
            }
            
            const spans = possibleGames[i].querySelectorAll('div span');
            
            //check if the message is a flood game
            if (spans[1].textContent.trim() === 'Flood' && this.img) {
                this.game.node = possibleGames[i];

                //go up 4 in the DOM (tree?)
                this.game.message.node = this.game.node;
                for (let j = 0; j < 4; j++) {
                    this.game.message.node = this.game.message.node.parentElement;
                }

                this.game.message.time = this.game.message.node.querySelector('time[datetime]');
                this.game.message.date = new Date(this.game.message.time.getAttribute('datetime'));
                const currentDate = new Date();
                
                const timeDifference = currentDate - this.game.message.date;
                const threeMinutes = 180000; //in milliseconds
                
                //check if the game is not older than 3 minutes
                if (timeDifference < threeMinutes) {
                    console.log('Game node found, node:', this.game.node);
                    return true;
                }
            }
        }

        //return false if nothing has been found
        console.log('No, matching, game was found.');
        return false;
    }

    async openfloodGame() {
        console.log('Performing click sequence... (openfloodGame)')

        const firstButton = document.querySelector('.entryPointAppCommandButton_a83188');
        if (firstButton) {
            firstButton.click();
        } else {
            console.log('First button not found, button with class="entryPointAppCommandButton_a83188 app-launcher-app-dm-entrypoint button__201d5 lookFilled__201d5 colorBrand__201d5 sizeLarge__201d5 grow__201d5".');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 50));

        const secondButton = document.querySelector('button[class^="commandSentCTAButton_c94584 button__201d5 lookFilled__201d5 colorPrimary__201d5 sizeIcon__201d5 grow__201d5"]');
        if (secondButton) {
            secondButton.click();
        } else {
            console.log('Second button not found, button with class="ccommandSentCTAButton_c94584 button__201d5 lookFilled__201d5 colorPrimary__201d5 sizeIcon__201d5 grow__201d5".');
            return false;
        }
    }

    updateGrid() {
        let images = this.game.grid.node.querySelectorAll('span > img');
        if (!images) {
            console.log('No images in the grid.node found');
            return false;
        }

        images.forEach((img, index) => {
            const row = Math.floor(index / this.game.grid.size);
            const col = index % this.game.grid.size;
            const name = img.getAttribute('data-name');
    
            if (name) {
                this.game.grid.matrix[row][col] = name;
            }
        })

        console.log("Updated grid:", this.game.grid.matrix);
        return true;
    }

    checkForAvailableOptions() {
        const currentColor = this.game.grid.matrix[0][0];
        let ownedSquares = Array(this.game.grid.size).fill(null).map(() => Array(this.game.grid.size).fill(false));
        let borderingColors = {};
        let directions = [
            [-1, 0], //Up
            [1, 0], //Down
            [0, -1], //Left
            [0, 1] //Right
        ]
        
        ownedSquares[0][0] = true
        console.log(`Current color: ${currentColor}`);
        
        ownedSquares.forEach((row, rowIndex) => {
            row.forEach((element, colIndex) => {
                if (element === true) {
                    for (let i = 0; i < directions.length; i++) {
                        let newRowIndex = rowIndex + directions[i][0];
                        let newColIndex = colIndex + directions[i][1];
                        
                        if (newRowIndex >= 0 && newColIndex >= 0 && newRowIndex < 10 && newColIndex < 10) {
                            if (this.game.grid.matrix[newRowIndex][newColIndex] === currentColor) {
                                ownedSquares[newRowIndex][newColIndex] = true;
                            } else {
                                borderingColors = {};
                                let key = this.game.grid.matrix[newRowIndex][newColIndex];

                                if (key in borderingColors) {
                                    borderingColors[key]++;
                                } else {
                                    borderingColors[key] = 1;
                                }
                            }
                        }
                    }
                }
            })
        })
        console.log('Bordering color: ', borderingColors);
        this.availableColors = borderingColors;
    }
    
    chooseBestOption() {
        // Find the key with the highest value in the availableColors object
        this.bestoption = Object.keys(this.availableColors).reduce((maxKey, currentKey) => {
            return this.availableColors[currentKey] > this.availableColors[maxKey] ? currentKey : maxKey;
        });
    
        console.log(`Best option: ${this.bestoption}`);
    }

    clickBestOption() {
        let buttons = this.game.message.node.querySelectorAll('button[class^="button__201d5 lookFilled__201d5 colorPrimary__201d5 sizeSmall__201d5 grow__201d5"]')

        buttons.forEach((button, buttonIndex) => {
            let img = button.querySelector('div div img')
            let dataname = img.getAttribute('data-name')
            if (dataname === this.colorMapping[this.bestoption]) {
                console.log('Clicking: ', this.bestoption, '/', dataname)
                button.click();
            }
        })
    }

    async playGame() {
        while (true) {

            if (this.floodGameOpen() === false) {
                this.openfloodGame();
                
                //wait for the game to actually open
                await new Promise(resolve => setTimeout(resolve, 1750));
            } else {
                this.updateGrid();
                this.checkForAvailableOptions();
                this.chooseBestOption();
                this.clickBestOption();
                
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
    }
}


class slots {
    constructor() {
        this.wallet = {
            node: null,
            balance: null,
        }
        this.game = {
            bet: null,
            result: null,
        }

        this.playGame();
    }

    async checkbalance() {
        //open '/wallet'
        console.log('Performing click sequence... (checkbalance)')

        const firstButton = document.querySelector('.entryPointAppCommandButton_a83188');
        if (firstButton) {
            firstButton.click();
        } else {
            console.log('First button not found, button with class="entryPointAppCommandButton_a83188 app-launcher-app-dm-entrypoint button__201d5 lookFilled__201d5 colorBrand__201d5 sizeLarge__201d5 grow__201d5".');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 50));

        const divs = document.querySelectorAll('div[class^="text-sm/semibold_cf4812"]');
        divs.forEach(async (div) => {
            const divText = div.textContent;
            if (divText === 'wallet') {
                div.click();
                
                await new Promise(resolve => setTimeout(resolve, 50));

                const event = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    code: 'Enter',
                    keyCode: 13,
                    which: 13,
                    bubbles: true
                });

                const activeElement = document.activeElement;
                if (activeElement) {
                    activeElement.dispatchEvent(event);
                } else {
                    console.log("No active element to send event to.");
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));

                const walletmessages = document.querySelectorAll('img[aria-label="🥟"]');
                if (walletmessages) {
                    let walletmessage = walletmessages[walletmessages.length - 2]; //walletmessage = last node in walletmessages
                    walletmessage = walletmessage.parentElement.parentElement;
                    this.wallet.balance = walletmessage.querySelector('strong > span').textContent.trim();
                    if (this.wallet.balance) {
                        console.log('Found balance. Balnce: ', this.wallet.balance)
                    } else {
                        console.log('something went wrong, this.wallet.balance is false')
                    }
                    console.log('after this.wallet.balance if/else.');
                } else {
                    console.log('No imgs with aria-label="🥟" found.')
                }
                console.log('after walletmessage if/else.');
            }
        })
    console.log('end of checkbalance.');
    }

    readOutcome() {
        console.log('readOutcome called');
        console.log(this.game.bet);
        if (this.game.bet !== null) {
            let possibleGames = document.querySelectorAll('div[class^="grid__623de"]');
            possibleGames = document.querySelectorAll('div[class^="grid__623de"]');
            let game = possibleGames[possibleGames.length - 1];
            game = possibleGames[possibleGames.length - 1];
            let textDiv = game.querySelector('div[class^="embedFieldName__623de"]');
            textDiv = game.querySelector('div[class^="embedFieldName__623de"]');
            if (textDiv) {
                this.text = textDiv.querySelector('span').textContent.trim();
            } else {
                game = possibleGames[possibleGames.length - 2];
                textDiv = game.querySelector('div[class^="embedFieldName__623de"]');
                this.text = textDiv.querySelector('span').textContent.trim();
            }
            //seems to need to be defined twice, it works, maybe, idk..

            if (this.text === 'Lost') {
                this.game.result = 'lose';
                console.log('this.game.result is "lose"');
            } else if (this.text === null) {
                console.log('text is null');
            } else if (this.text === undefined ) {
                console.log('text is undefined');
            } else {
                console.log('this.game.result is somewhat this: ', this.text);
                this.game.result = 'win';
            }
            console.log('end of if statement in readOutcome()');
        }
        console.log('end of readOutcome()');
    }

    adjustBet() {
        console.log('adjustBet called.');
        console.log('Result: ', this.game.result);
        const maxThing = Math.floor(this.wallet.balance / 4 );
        const bets = {
            first: Math.ceil(maxThing / 38.449609375),
            second: Math.ceil(maxThing / 76.89921875),
            third: Math.ceil(maxThing / 51.266145833333),
            fourth: Math.ceil(maxThing / 34.177430555555),
            fifth: Math.ceil(maxThing / 22.784953703703),
            sixth: Math.ceil(maxThing / 15.152555418719),
            seventh: Math.ceil(maxThing / 10.126646090534),
            eighth: Math.ceil(maxThing / 6.751097393689),
            ninth: Math.ceil(maxThing / 4.500731595793),
            tenth: Math.ceil(maxThing / 3.000487730528),
        }
        console.log(bets.first);
        console.log(bets.second);
        console.log(bets.third);
        console.log(bets.fourth);
        console.log(bets.fifth);
        console.log(bets.sixth);
        console.log(bets.seventh);
        console.log(bets.eighth);
        console.log(bets.ninth);
        console.log(bets.tenth);
        const betsKeys = Object.keys(bets);

        if (this.game.result === 'win' || this.game.result === null) {
            this.game.bet = bets.first;
        } else {
            console.log('DEBUGGING | this.game.result = ', this.game.result);
            let betNotFound = true;
            let index = 0;
            while (betNotFound) {
                console.log('DEBUGGING | index = ', index);
                console.log('DEBUGGING | bets[index] = ', bets[betsKeys[index]]);
                if (index === 9) {
                    console.log('DEBUGGING | index === 9');
                    this.game.bet = bets.first;
                    betNotFound = false;
                } else if (this.game.bet === bets[betsKeys[index]]) {
                    console.log('DEBUGGING | this.game.bet === bets[index]');
                    this.game.bet = bets[betsKeys[++index]];
                    betNotFound = false
                } else if (index > 9) {
                    console.log('Ehhhhhm.. the index in the while loop of the adjustBet function is... higher than 9.? If you see this, there is absolutely no hope for this script..')
                } else {
                    console.log('DEBUGGING | index++');
                    index++
                }
            }
        }
    }

    async openSlotsGame() {
        console.log('Performing click sequence... (openSlotsGame)')

        const firstButton = document.querySelector('.entryPointAppCommandButton_a83188');
        if (firstButton) {
            firstButton.click();
        } else {
            console.log('First button not found, button with class="entryPointAppCommandButton_a83188"');
            return false;
        }

        await new Promise(resolve => setTimeout(resolve, 50));

        const divs = document.querySelectorAll('div[class^="text-sm/semibold_cf4812"]');
        (async () => {
            for (const div of divs) {
                if (div.textContent === 'slot-machine') {
                    div.click();
                    await new Promise(resolve => setTimeout(resolve, 150));
        
                    console.log('Bet: ', this.game.bet);
        
                    const inputEvent = new InputEvent('beforeinput', {
                        bubbles: true,
                        cancelable: true,
                        inputType: 'insertText',
                        data: this.game.bet
                    });
        
                    const textbox = document.querySelector('[data-slate-editor="true"]');
                    textbox.dispatchEvent(inputEvent);
                    await new Promise(resolve => setTimeout(resolve, 50));
        
                    const keyboardEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    });

                    textbox.focus();
                    textbox.dispatchEvent(keyboardEvent);
                    break;
                }
            }
        })();
    }

    async playGame() {
        while (true) {
            if (this.wallet.balance === null || this.game.result === 'win'){
                this.checkbalance();
                await new Promise(resolve => setTimeout(resolve, 2750)); //wait because async/await is confusing and this works
            }
            this.adjustBet();
            await this.openSlotsGame();
            await new Promise(resolve => setTimeout(resolve, 10000)); //10 seconds
            this.readOutcome();
        }
    }
}
sl = new slots;
//fl = new flood;


/*
textbox = document.querySelector('[data-slate-editor="true"]'); > textbox.focus();
imput:  const event = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: '1320'
        });

enter:  const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        });
*/
class Casino {
    private _name: string;
    public _machines: Array<GameMachine> = [];
    constructor(name: string) {
        this._name = name;
    }
    get getMoney(): number {
        let sumOfAllMoneyInMachines: number = 0;
        for (let machineElement of this._machines) {
            sumOfAllMoneyInMachines = sumOfAllMoneyInMachines + machineElement.allMoneyInMachine;
        }
        return sumOfAllMoneyInMachines;
    }
    get getMachineCount() {
        return this._machines.length;
    }
}

class GameMachine {
    private _sumOfAllMoneyInMachine: number;

    constructor(startAmountOfMoney: number) {
        this._sumOfAllMoneyInMachine = startAmountOfMoney;
    }
    get allMoneyInMachine(): number {
        return this._sumOfAllMoneyInMachine;
    }
    putMoneyInMachine(value: number) {
        this._sumOfAllMoneyInMachine =  this._sumOfAllMoneyInMachine + value;
    }
    getMoneyFromMachine(value: number) {
        this._sumOfAllMoneyInMachine =  this._sumOfAllMoneyInMachine - value;
    }
    play (count: number): number{
        if (this.allMoneyInMachine < count*3){
            return 0;
        }
        //Створюємо рандомне 3 значне число і переводимо його в масив для перевірки
        //на наявність співпадінь.
        let randomNumber = Math.floor(100 + Math.random() * 900);
        let s = randomNumber.toString();
        let strings = s.split("");
        //Перевіряєм чи є співпадіння
        let dublicate: number = 1;
        if (strings[0] == strings[1] && strings[0] == strings[2]){
            dublicate = 3;
        } else if(strings[0] == strings[1] || strings[0] == strings[2]){
            dublicate = 2;
        } else if (strings[1] == strings[0] || strings[1] == strings[2]){
            dublicate = 2;
        }
        //Якщо є співпадіння знімаємо відповідну суму з рахунку казино,
        //якщо співпадінь немає додаємо суму до рахунку казино.
        if(dublicate > 1){
            this.getMoneyFromMachine(count*dublicate);
        }else{
            this.putMoneyInMachine(count);
        }
        //Виводимо в консоль, те, що показав "автомат"
        console.log()
        console.log("$$$$$$$$$$$$$$$$$$$$$$");
        console.log("Numbers on GameMachine");
        console.log(strings);
        console.log("$$$$$$$$$$$$$$$$$$$$$$");
        return dublicate;
    }
}

class User{
    public _name:string;
    public _money:number;

    constructor(name: string, money: number) {
        //Запобігаю нелогічній поведінці (гравець без грошей або менше 0)
        if(money <= 0){
            console.log("Sorry. You cant play without money!");
        }else {
            this._name = name;
            this._money = money;
        }
    }
    //Метод для гри, приймає вибраний "автомат" і суму поставлених грошей.
    play(nameOfGameMachine: GameMachine, countOfMoney: number): string{
        if((this._money - countOfMoney) < 0){
            return "Sorry, " + this._name + ". You dont have so much money"
        }else {
            //Викликаю у вибраного автомата метод play, якщо він повертає 2 або 3,
            //тоді ставку грався множимо на повернену суму,
            // а якщо повертає щось інше то віднімаю поставлену суму у гравця
            let result = nameOfGameMachine.play(countOfMoney);
            //Запобігти нелогічній поведінці (кількість грошей в автоматі менше 0)
            if(result == 0){
                return "Sorry, this GameMachine do not have money";
            }
            if(result > 1){
                this._money = this._money + (countOfMoney*result);
                return this._name + " you win. Now you have " + this._money + " dollars";
            }else if(result == 3){
                this._money = this._money + (countOfMoney*result);
                return this._name + " you win. Now you have " + this._money + " dollars";
            }else {
                this._money = this._money - countOfMoney;
                return this._name + ", Casino win. Try again if you have money. Now you have " + this._money + " dollars";
            }
        }
    }
}
class SuperAdmin extends User{
    constructor(name: string, money: number) {
        super(name, money);
    }
    //SuperAdmin може створювати казино
    createCasino(name: string): Casino{
        return new Casino(name);
    }
    //SuperAdmin може створювати ігрові автомати у власному Casino,
    //у цьому випадку гроші знімаються з його рахунку.
    createGameMachine(casinoName: Casino,startAmountOfMoney: number) :GameMachine{
        if(this._money < startAmountOfMoney){
            console.log( "Sorry, You dont have money for create this casino!")
            return null;
        }else {
            this._money = this._money - startAmountOfMoney;
            let newGameMachine = new GameMachine(startAmountOfMoney);
            casinoName._machines.push(newGameMachine);
            console.log("You create new Game Machine")
            return newGameMachine;
        }
    }
    //SuperAdmin має метод щоб забирати гроші з Casino
    getMoneyFromCasino(casinoName: Casino, amountOfMoney:number) :string{
        let take: number = amountOfMoney;
        //Перевіряємо чи в казино взагалі є стільки грошей.
        if (casinoName.getMoney < amountOfMoney){
            return "Sorry! Сasino dont have so much money";
        }
        //Сортую автомати відповідно до суми грошей в них, в першому найбільше
        let sortedMachines = casinoName._machines.sort().reverse();
        //Перевіряю чи грошей в "найбагатшому" автоматі достатньо для видачі
        //якщо так, то одразу видаю
        if(sortedMachines[0].allMoneyInMachine >= amountOfMoney){
            sortedMachines[0].getMoneyFromMachine(amountOfMoney);
            return "You successfully take from casino: " + take + " dollars";
        }
        //Якщо грошей не достатньо проходжусь по всіх автоматах, поки не назбираю достатньої суми
        if (sortedMachines[0].allMoneyInMachine < amountOfMoney){
            let index: number = 0;
            let cont: boolean = true;
            while (cont){
                //Віднімаю від потрібної суми грошей гроші в автоматі[index]
                amountOfMoney = amountOfMoney - sortedMachines[index].allMoneyInMachine;
                //Забираю всі гроші з автомату[index]
                sortedMachines[index].getMoneyFromMachine(sortedMachines[index].allMoneyInMachine);
                //Якщо потрібна сума вже менше 0, значить це був останній автомат
                //мінус який прийшов у amountOfMoney це і буде залишок в автоматі
                if(amountOfMoney <= 0){
                    sortedMachines[index].putMoneyInMachine(Math.abs(amountOfMoney));
                    cont = false;
                }
                index++;
            }
            return "You successfully take from casino: " + take + " dollars";
        }

    }
    //SuperAdmin може додавати гроші в автомат:
    //вписавши суму грошей, вибрашви казино в якому він це хоче зробити і автомат котрому додати гроші.
    putMoneyInGameMachine(amountOfPutMoney: number, casino: Casino, gameMachine: GameMachine ): string{
        if(this._money < amountOfPutMoney){
            return "You dont have so mach money!"
        } else {
            //Віднімаю покладені гроші від суми грошей у SuperAdmin
            this._money = this._money - amountOfPutMoney;
            //Знаходжу казино в яке треба покласти гроші і на його рахунок закидаю гроші SuperAdmin
            casino._machines[casino._machines.indexOf(gameMachine)].putMoneyInMachine(amountOfPutMoney);
            return "You successfully put in GameMachine: " + amountOfPutMoney + " dollars";
        }
    }
    //SuperAdmin може видалити ігровий автомат з вибраного казино
    // гроші в такому випадку з автомата рівномірно розподіляються між іншими автоматами в казино
    deleteGameMachine(indexOfDeleteMachine: number, casino: Casino): string{
        //Запобігаю нелогічній поведінці (видалення неіснуючого автомату)
        if((casino._machines.length -1) < indexOfDeleteMachine){
            return "Casino do not have GameMachine with index " + indexOfDeleteMachine;
        }
        //В змінну записую гроші які є в видаляємому автоматі
        let deleteMachineMoney = casino._machines[indexOfDeleteMachine].allMoneyInMachine;
        //Видаляю автомат
        casino._machines.splice(indexOfDeleteMachine, 1);
        //Визначаю кількість автоматів в казино
        let countMachineInCasino = casino._machines.length;
        //Проходжусь по кожному автоматі додаючи до його суми грошей рівну частину з видаленого автомату
        for (let casinoElement of casino._machines) {
            casinoElement.putMoneyInMachine(deleteMachineMoney/countMachineInCasino)
        }
        return "You successfully delete in GameMachine";
    }
    //Має всі властивості User'a, туж людина і може грати
    play(nameOfGameMachine: GameMachine, countOfMoney: number): string {
        return super.play(nameOfGameMachine, countOfMoney);
    }
}

let superAdmin = new SuperAdmin("Boss", 1000);
let LasVegas = superAdmin.createCasino("LasVegas");
let user = new User("Stepan", 1000);
let gameMachine1 = superAdmin.createGameMachine(LasVegas, 200);
let gameMachine2 = superAdmin.createGameMachine(LasVegas, 200);

console.log(user.play(gameMachine1, 10));
console.log(user.play(gameMachine1, 100));
console.log(superAdmin.play(gameMachine2, 50));
console.log(superAdmin.play(gameMachine2, 800));

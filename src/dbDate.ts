const MSTOGG = 1000 * 60 * 60 * 24;

export class dbDate{
  date: Date;

  constructor(old: any = null){
    //console.log(old);
    if (old == null){
      this.date = new Date();
    }
    else{
      switch(typeof(old)){
        case "number":
        case "string":
        case "object":
          this.date = new Date(old);
          //console.log(this.date);
          //console.log(typeof(this.date));
        break;
        default:
          console.log(typeof(old));
        break;
      }
    }
  }

  toDateString(): string{
    let out:string = this.date.getFullYear().toString() + "-";

    if(this.date.getMonth() + 1 < 10){
      out += "0" + (this.date.getMonth()+1).toString() + "-";
    }
    else{
      out += (this.date.getMonth()+1).toString() + "-";
    }
    
    if (this.date.getDate() < 10){
      out += "0" + this.date.getDate().toString();
    }
    else{
      out += this.date.getDate().toString();
    }

    return out;
  }

  toMilliseconds():number{
    return this.date.valueOf();
  }

  addDays(days: number): dbDate{
    return new dbDate(this.date.valueOf() + (days * MSTOGG));  
  }

  getMonth(): number{
    return this.date.getMonth() + 1;
  }
  
  addMonth(months: number): dbDate{
    return new dbDate(this.date.setMonth(this.date.getMonth() + months));
  }
}
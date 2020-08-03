export class $ {
    private list: Function [];
    public constructor(){
        this.list=[];
    }
    public static Callbacks(){
        return new $();
    }
    public add(temp:Function){
        console.log("added",temp.toString());
        this.list.push(temp)
    }
    public fire(...argument:any){
        for(let i=0;i<this.list.length;i++){
            console.log("fired",this.list[i].toString());
            this.list[i](argument);
        }
    }
    public remove(item:Function){
        for(let i=0;i<this.list.length;i++){
            if(this.list[i]===item){
                this.list.splice(i,1)
            }
        }
    }
}
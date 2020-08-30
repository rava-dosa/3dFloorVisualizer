export interface PubSubEv {
    topic: String; //2d or 3d
    subtopic: String; //insert {corners, edge}, update{corners, edge}, delete{corners, edge}
    event_details:any;//complete event
    type?: string;//remote or local
    id?:string;//unique id
    time?:string;//unix timestamp
  }
interface Subs{
    topic: String;
    subtopic?: String;
    id?: String
    func:Function;
}
export class PubSub{
    private allevent: PubSubEv[];
    private allsubs: Subs [];
    private static instance: PubSub;
    private constructor(){
        this.allevent=[];
        this.allsubs=[];
    }
    static getInstance() {
        if (!PubSub.instance) {
            PubSub.instance = new PubSub();
            // ... any one time initialization goes here ...
        }else{
            return PubSub.instance;
        }
        return PubSub.instance;
    }
    public publish(newevent:PubSubEv):void{
      
        this.allevent.push(newevent);
        for (let x of this.allsubs){
            if(x.topic==newevent.topic && x.subtopic==newevent.subtopic){
                x.func(newevent.event_details);
            }
        }
    }
    public fine_subscribe(topicx:string,subtopicx:string, funcx:Function):void{
        let temp:Subs={topic:topicx,subtopic:subtopicx,func:funcx};
        this.allsubs.push(temp);
    }
    public coarse_subscribe(topicx:string,funcx:Function):void{
        let temp:Subs={topic:topicx,func:funcx};
        this.allsubs.push(temp);
    }
    public log_subscribe(topicx:string,subtopicx:string):void{
        this.fine_subscribe(topicx,subtopicx,this.logger);
    }
    private logger(event:String):void{
        console.log(event);
    }
}
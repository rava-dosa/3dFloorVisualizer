export class Basic3d{
    public x?:number;
    public y?:number;
    public z?:number;
    constructor (params: Basic3d = {} as Basic3d){
        let {
            x=0,
            y=0,
            z=0
        }=params
        this.x=x;
        this.y=y;
        this.z=z;
    }

}
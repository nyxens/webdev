console.log("hello");
let num = "hello world";
console.log(num);
let arr = [1,2,3,4,5];
// for(let i of arr){
    //     console.log(i);
    // }
    // for(let i in arr){
        //     console.log(arr[i]);
        // }
arr.push(6);
console.log(arr);
let obj = {
    id: "krishna",
    age: 18
};
let a = [
    {id:"krishna",age:18},
    {id:"hem",age:19},
    {id:"keer",age:20},
    {id:"adi",age:21},
];
a.forEach(element => {
    element.age = 18;
});
console.log(a);

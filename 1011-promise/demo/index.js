// check if promise is overwrit
console.log(Promise);

new Promise(resolve => {
    console.log(1);
    resolve(3);
}).then(num => {
    console.log(num)
});
console.log(2);
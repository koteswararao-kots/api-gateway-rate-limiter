// class TreeNode {
//   constructor(val, left=null, right=null) {
//     this.val = val
//     this.left = left
//     this.right = right
//   }
// }

// // let root = new TreeNode(1)
// // root.left = new TreeNode(2)
// // root.right = new TreeNode(3)
// // root.left.left = new TreeNode(4)
// // root.left.right = new TreeNode(5)


// //for BST
// let root = new TreeNode(5)
// root.left = new TreeNode(3)
// root.right = new TreeNode(7)
// root.left.left = new TreeNode(2)
// root.left.right = new TreeNode(4)
// root.right.left = new TreeNode(6)
// root.right.right = new TreeNode(8)

// let result = []
// function postorder(root) {
//   if (root == null) return
//   postorder(root.left)
//   postorder(root.right)
//   result.push(root.val)
 
// }
// postorder(root)
// console.log("Postorder traversal:", result)

// let result1 = []
// function inorder(root) {
//   if (root == null) return
//   inorder(root.left)
//   result1.push(root.val)
//   inorder(root.right)
// }
// inorder(root)
// console.log("Inorder traversal:", result1) 

// function findMaxBST(root) {
//   while (root.right != null) {
//     root = root.right
//   }
//   return root.val
// }

// console.log(findMaxBST(root))

// function findMinBST(root) {
//   while (root.left != null) {
//     root = root.left
//   }
//   return root.val
// }

// console.log(findMinBST(root))



// let graph = [
//     [1, 2], // 0
//     [0, 3], // 1
//     [0, 3], // 2
//     [1, 2]  // 3
// ];


function graphBFS() {
  let queue = [0];
  let front = 0;
  let visited = new Set();

  visited.add(0);

  while (front < queue.length) {
    let node = queue[front];
    console.log("node:", node);
    console.log("Front:", front);
    front++;


    for (let neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
            visited.add(neighbor);
            console.log("Visited:", visited);
            queue.push(neighbor);
            console.log("Queue:", queue);
        }
    }
}
}

// graphBFS();



let graph = [
    [1, 2], // 0
    [0, 3], // 1
    [0, 3], // 2
    [1, 2]  // 3
];

// let visited = new Set();
// function graphDFS(node) {
//   if (visited.has(node)) return;
//   visited.add(node);
//   console.log("node:", node);
//   for (let neighbor of graph[node]) {
//     graphDFS(neighbor);
//   }
// }
// graphDFS(0);
// console.log("Visited:", visited);



// let visited = new Set();
// function graphDFS(node) {
//   // if (visited.has(node)) return;

//   for (let neighbor of graph[node]) {
//     if (!visited.has(neighbor)) {
//       console.log("neig", neighbor)
//       visited.add(neighbor)
//       graphDFS(neighbor);
//     }
//   }
// }
// graphDFS(0);
// console.log("Visited:", visited);


//heap 

// class minHeap {
//   constructor() {
//     this.heap = [];
//   }
//   peek() { 
//     if (this.isEmpty()) return -1 
//     return this.heap[0];  
//   }
//   heapifyUp() {
//     let current = this.heap.length-1
    
//     while (current > 0 ) {
//       let parent = Math.floor((current-1)/2)
//       if (this.heap[parent] <= this.heap[current]) break;
//       [this.heap[parent], this.heap[current]] = [this.heap[current], this.heap[parent]]
//       current = parent
      
//     }
//   }

//   heapifyDown() {
//     this.parent = 0
//     let leftChild = 2 * 0 + 1
//     let rightChild = 2 * 0 + 2
//     while (this.heap[this.parent] > this.heap[leftChild] || this.heap[this.parent] > this.heap[rightChild]) {
//       let smallChild = this.heap[leftChild] < this.heap[rightChild] ? leftChild : rightChild
//       [this.heap[this.parent], this.heap[smallChild]] = [this.heap[this.smallChild], this.heap[this.parent]]
//       this.parent = smallChild
//     }
//   }
//   insert(val) {
//     this.heap.push(val);
//     this.heapifyUp()

//   }
//   extractMin() {
//     if (this.isEmpty()) return -1
//     if (this.heap.length == 1) return this.heap.pop();
//     // console.log("before swap:", this.heap);
//     [this.heap[0], this.heap[this.heap.length-1]] = [this.heap[this.heap.length-1], this.heap[0]]
//     console.log("afterswap", this.heap)
//     let small = this.heap.pop()
//     this.heapifyDown()
//     return small
    
//   }
//   size() {
//     return this.heap.length
//   }
//   isEmpty() {
//     return this.heap.length === 0
//   }
// }

// let heap = new minHeap();
// heap.insert(5);
// heap.insert(3);
// heap.insert(8);
// heap.insert(1);
// console.log(heap.peek())
// console.log(heap.heap); // Output: [1, 3, 8, 5]
// console.log(heap.extractMin())
// console.log(heap.heap)


function factorial(n) {
    if (n <= 1) {
        return 1
    }
    return n*factorial(n-1)
}

function fibonacci(n) {
    if (n == 0) return 0
    if (n==1) return 1
    return fibonacci(n-1) + fibonacci(n-2)
}
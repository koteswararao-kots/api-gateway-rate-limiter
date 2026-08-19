class TreeNode {
  constructor(val, left=null, right=null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// let root = new TreeNode(1)
// root.left = new TreeNode(2)
// root.right = new TreeNode(3)
// root.left.left = new TreeNode(4)
// root.left.right = new TreeNode(5)


//for BST
let root = new TreeNode(5)
root.left = new TreeNode(3)
root.right = new TreeNode(7)
root.left.left = new TreeNode(2)
root.left.right = new TreeNode(4)
root.right.left = new TreeNode(6)
root.right.right = new TreeNode(8)

let result = []
function postorder(root) {
  if (root == null) return
  postorder(root.left)
  postorder(root.right)
  result.push(root.val)
 
}
postorder(root)
console.log("Postorder traversal:", result)

let result1 = []
function inorder(root) {
  if (root == null) return
  inorder(root.left)
  result1.push(root.val)
  inorder(root.right)
}
inorder(root)
console.log("Inorder traversal:", result1) 

function findMaxBST(root) {
  while (root.right != null) {
    root = root.right
  }
  return root.val
}

console.log(findMaxBST(root))

function findMinBST(root) {
  while (root.left != null) {
    root = root.left
  }
  return root.val
}

console.log(findMinBST(root))
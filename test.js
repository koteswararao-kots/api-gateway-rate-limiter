class TreeNode {
  constructor(val, left=null, right=null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

let root = new TreeNode(1)
root.left = new TreeNode(2)
root.right = new TreeNode(3)
root.left.left = new TreeNode(4)
root.left.right = new TreeNode(5)

let result = []
function postorder(root) {
  if (root == null) return
  postorder(root.left)
  postorder(root.right)
  result.push(root.val)
 
}
postorder(root)
console.log(result) 
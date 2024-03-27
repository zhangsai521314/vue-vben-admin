const AntVueCommon = {
    //antvue select搜索,
    filterOption(inputValue, option, title = "label") {
        return option[title].toLowerCase().indexOf(inputValue) != -1;
    },
    //antvue tree-select搜索
    filterTreeNode(inputValue, treeNode, title = "title") {
        return treeNode[title].toLowerCase().indexOf(inputValue) != -1;
    }
}
export default AntVueCommon;
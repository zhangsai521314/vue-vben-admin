const AntVueCommon = {
  //antvue select搜索,
  filterOption(inputValue, option, title = 'label', value = 'value') {
    return option[title]
      ? option[title].toLowerCase().indexOf(inputValue) != -1
      : option[value].toLowerCase().indexOf(inputValue) != -1;
  },
  //antvue tree-select搜索
  filterTreeNode(inputValue, treeNode, title = 'title', value = 'value') {
    return treeNode[title]
      ? treeNode[title].toLowerCase().indexOf(inputValue) != -1
      : treeNode[value].toLowerCase().indexOf(inputValue) != -1;
  },
};
export default AntVueCommon;

<script>
const RenderVNode = (props) => props.vnode;
RenderVNode.props = { vnode: { type: Object, required: true } };
RenderVNode.emits = ['action'];
export default RenderVNode;
</script>

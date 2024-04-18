<script>
const RenderVnode = (props) => {
  if (props.vnode.__v_isVNode) {
    return props.vnode;
  }

  if (props.vnode.__v_isRef) {
    return props.vnode.value;
  }

  if (typeof props.vnode === "function") {
    return props.vnode();
  }

  return null;
};
RenderVnode.props = { vnode: { type: [Function, Object], required: true } };
export default RenderVnode;
</script>

<script>
import { isRef, isVNode } from "vue";

const RenderVnode = (props) => {
	if (isVNode(props.vnode)) {
		return props.vnode;
	}

	if (isRef(props.vnode)) {
		return props.vnode.value;
	}

	if (typeof props.vnode === "function") {
		return props.vnode(props.props, props.params);
	}

	return null;
};
RenderVnode.props = {
	vnode: {
		type: [Function, Object],
		required: true
	},
	props: {
		type: Object,
		default: () => ({})
	},
	params: {
		type: Object,
		default: null
	}
};
export default RenderVnode;
</script>

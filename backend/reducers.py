def combine_model_outputs(outputs, mode):
    """
    Reducer: If 'code', merge code blocks & comments. If 'image', concatenate all. For 'thinking', summarize.
    """
    if mode == "code":
        codes = []
        for out in outputs:
            code_lines = []
            in_code = False
            for l in out.splitlines():
                if l.strip().startswith("```"):
                    in_code = not in_code
                    continue
                if in_code or l.strip().startswith("#") or l.strip().startswith("//"):
                    code_lines.append(l)
            codes.append("\n".join(code_lines))
        combined = "\n\n".join(set(filter(None, codes)))
        return f"💻 Top code suggestions:\n{combined}"
    elif mode == "image":
        return "🖼️ " + "\n\n".join(outputs)
    elif mode == "thinking":
        return "🤔 " + "\n\n".join(outputs)
    else:
        return "\n\n".join(outputs)

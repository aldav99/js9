class HtmlElement {
    constructor(renderStr, unrenderStr) {
        this._render = renderStr || "append";
        this._target;
        this._variables;
        this._template;
        this._fillTemplate;
        this._styles;
        this._element;
        this._unrender = unrenderStr || "new";
    }

    constructorName() {
        return this.constructor.name;
    }

    set template(str) {
        str = str.trim();

        let className = this.constructorName();
        let regexp = /^<(.*?)>(.*)<\/\1>$/;
        let result = str.match(regexp);

        if (!result || result[1] != className)
            throw new Error('Unknow template');

        this._template = result[2];

        return this._template;
    }

    set variables(obj) {
        this._variables = obj;
        return this._variables;
    }

    set styles(obj) {
        this._styles = obj;

        let elementsDelete = document.getElementsByClassName(this._unrender);

        if (elementsDelete.length > 0)
            elementsDelete[0].remove();

        this.render();
    }

    set target(domElement) {
        if (!domElement.parentNode)
            throw new Error('Can not find domElement');
        this._target = domElement;
    }

    render() {
        this._fillTemplate = this._template;

        for (let key in this._variables) {
            if (typeof (this._variables[key]) == 'function') {
                let strMatch = '{{' + key + '.+?' + '}}';
                let re = new RegExp(strMatch, 'gi');

                let result = this._fillTemplate.match(re);

                let regexp = /\((.+?)\)/;

                let param = result[0].match(regexp);
                let arrParam = param[1].split(',');

                let res = this._variables[key].apply(null, arrParam);
                this._fillTemplate = this._fillTemplate.replace(re, res);

            }

            let re = new RegExp('{{' + key + '}}', 'gi');

            this._fillTemplate = this._fillTemplate.replace(re, this._variables[key]);
        }


        let resultStyles = "";
        let keyHtml;

        for (let key in this._styles) {
            keyHtml = key.replace(/([A-Z])/g, '-$1').toLocaleLowerCase();
            resultStyles += keyHtml + ':' + ' ' + this._styles[key] + ';' + " ";
        }

        resultStyles = resultStyles.trim();

        let insertElement = document.createElement(this.constructorName());

        insertElement.classList.add(this._unrender);

        insertElement.style.cssText = resultStyles;

        insertElement.textContent = this._fillTemplate;

        this._element = insertElement;

        switch (this._render) {
            case "append":
                this._target.append(insertElement);
                break;
            case "prepend":
                this._target.prepend(insertElement);
                break;
            default:
                this._target.append(insertElement);
        }

    }

    unrender() {
        // let elementsDelete = document.getElementsByClassName(this._unrender);
        // elementsDelete[0].remove();
        this._element.remove();
    }
}

class Input extends HtmlElement {
    set onFocus(func) {
        // let elementFocusable = document.getElementsByClassName(this._unrender);
        // let element = elementFocusable[0];
        // element.tabIndex = 1;
        // element.onfocus = func;
        this._element.tabIndex = 1;
        this._element.onfocus = func;
    }

    set onInput(func) {
        // let elementInputable = document.getElementsByClassName(this._unrender);
        // let element = elementInputable[0];
        // element.oninput = func;
        this._element.oninput = func;
    }
}

class Div extends Input {
    set onClick(func) {
        let elementClickable = document.getElementsByClassName(this._unrender);
        elementClickable[0].onclick = func;
    }
}

class TextArea extends Input {
}
div = new Div();

div.variables = {
    output: 'Text1',
    input: 'Text2',
    func: function (x, y) {
        x = Number(x);
        y = Number(y);
        return x + y;
    }
};
div.template = '<Div>{{output}} --{{func(3,6)}}-- {{input}}</Div>';

let tag = document.getElementById('test');
div.target = tag;
div.styles = { color: "red", fontSize: "2em" };
div.onClick = () => { console.log('--------test--------') };
div.onFocus = () => { console.log('--------FOCUS--------') };

textarea = new TextArea("preppend", "textarea");
textarea.template = '<TextArea>PRIVET</TextArea>'
textarea.target = tag;
textarea.styles = { color: "blue", fontSize: "2em" };
textarea.onInput = () => { console.log('--------Input--------') };


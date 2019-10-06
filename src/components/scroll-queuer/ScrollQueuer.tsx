import * as React from "react";
import "./ScrollQueuer.scss";

interface Props {
    elementsToWatchOnScroll?: string;
    classToAddRemove?: string;
    desiredViewportHeightPercentage?: number;
}

interface State {
    // the elements to animate
    elements: any;
    // the class for the elements to animate
    elementsToWatchOnScroll: string;
    // the class that will be added and removed
    classToAddRemove: string;
    // percentage of the screen height till the class is added/removed
    desiredViewportHeight: number;
    // percentage of screen height the class should be added/removed
    desiredViewportHeightPercentage: number;
    // far the scroll is from top
    distanceTop: number;
    // the previous distanceTop
    previousDistance: number;
    // determines whether scrolling down or up
    isScrollDown: boolean;
    // determines if its the initial page load
    isInitialLoad: boolean;
    // the screens height
    viewportHeight: number;
}

const COMPONENT_NAME = "ScrollQueuer";

export class ScrollQueuer extends React.Component<Props, State> {

    public constructor(props: Props, context: any) {
        super(props, context);

        this.state = {
            elements: [],
            distanceTop: 0,
            previousDistance: 0,
            elementsToWatchOnScroll: this.props.elementsToWatchOnScroll || ".animate-on-scroll",
            classToAddRemove: this.props.classToAddRemove || "expandIn",
            desiredViewportHeight: 0,
            desiredViewportHeightPercentage: this.props.desiredViewportHeightPercentage || .5,
            isScrollDown: false,
            isInitialLoad: true,
            viewportHeight: 0
        };
    }

    public componentDidMount(): void {
        this.setState({
            viewportHeight: window.screen.height,
            desiredViewportHeight: window.screen.height * this.state.desiredViewportHeightPercentage
        });

        // ensures that the entire dom has loaded before searching for elements
        setTimeout(() => {
            this.setState({
                elements: document.querySelectorAll(this.state.elementsToWatchOnScroll)
            });

            this.spy();
        }, 0);
    }

    public render(): JSX.Element {
        return (
            <div
                className={COMPONENT_NAME}
                onScroll={(e) => this.handleScroll(e)}
            >
                {this.props.children}
            </div>
        );
    }

    private handleScroll(e: any): void {
        this.setState({
            isInitialLoad: false,
            distanceTop: e.target.scrollTop
        });

        // determine and set the scroll direction
        if(this.state.distanceTop > this.state.previousDistance) {
            this.setState({ isScrollDown: true });
        } else {
            this.setState({ isScrollDown: false });
        }

        this.setState({ previousDistance: this.state.distanceTop });

        this.spy();
    }

    private spy(): void {
        // iterate through each of the elements
        this.state.elements.forEach((element: any) => {
            // determine distance element is from top of screen
            const fromTop = element.offsetTop - document.querySelector(".ScrollSpy")!.scrollTop;

            // determine if we are scrolling down or this is initial load
            if(this.state.isScrollDown || this.state.isInitialLoad) {
                // is the element closer to the top than the desired trigger point
                if(fromTop < this.state.desiredViewportHeight) {
                    // add class expandIn
                    const addedClass = element.className.split(" ");
                    if(addedClass.indexOf(this.state.classToAddRemove) === -1) {
                        addedClass.push(this.state.classToAddRemove);
                        element.className = addedClass.join(" ");
                    }
                }
            } else {
                // is the element farther from the top than the desired trigger point
                if(fromTop > this.state.desiredViewportHeight) {
                    const classes = element.className.split(" ");
                    const index = classes.indexOf(this.state.classToAddRemove);
                    if(index > -1) {
                        classes.splice(index, 1)
                        element.className = classes.join(" ");
                    }
                }
            }
        });
    }
}

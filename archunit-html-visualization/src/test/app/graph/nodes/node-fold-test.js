'use strict';

const expect = require('chai').expect;

const rootCreator = require('../testinfrastructure/root-creator');
const createListenerMock = require('../testinfrastructure/listener-mock').createListenerMock;

const testWholeLayoutOn = require('../testinfrastructure/node-layout-test-infrastructure').testWholeLayoutOn;

const testOn = require('../testinfrastructure/node-test-infrastructure').testOnRoot;
const testGuiFromRoot = require('../testinfrastructure/node-userinteraction-adapter').testGuiFromRoot;

describe('Leaves', () => {
  it('do not notify their fold-finished-listeners or fold-listeners when clicking on them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
    const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold');
    root.addListener(nodeListenerMock.listener);

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
    nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
    nodeListenerMock.test.that.listenerFunction('onFold').was.not.called();
  });

  it('do not trigger a relayout when clicking on them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
    const nodeListenerMock = createListenerMock('onLayoutChanged');
    root.addListener(nodeListenerMock.listener);

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
    nodeListenerMock.test.that.listenerFunction('onLayoutChanged').was.not.called();
  });

  describe("public methods", () => {
    describe('#isFolded()', () => {
      it('returns false after clicking on a leaf', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
        expect(root.getByName('my.company.SomeClass').isFolded()).to.be.false;
      });
    });

    describe('#isCurrentlyLeaf()', () => {
      it('returns true after clicking on a leaf', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
        expect(root.getByName('my.company.SomeClass').isCurrentlyLeaf()).to.be.true;
      });
    });

    describe('#unfold()', () => {
      it('does not notify the fold-finished-listeners or fold-listeners', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
        const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold');
        root.addListener(nodeListenerMock.listener);

        root.getByName('my.company.SomeClass').unfold();
        nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
        nodeListenerMock.test.that.listenerFunction('onFold').was.not.called();
      });

      it('does not trigger a relayout', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
        const nodeListenerMock = createListenerMock('onLayoutChanged');
        root.addListener(nodeListenerMock.listener);

        root.getByName('my.company.SomeClass').unfold();
        nodeListenerMock.test.that.listenerFunction('onLayoutChanged').was.not.called();
      });
    });
  })
});

describe('Inner nodes', () => {
  it('can be folded via clicking on them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass$SomeInnerClass');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
    testOn(root).that.it.hasClasses('my.company.SomeClass');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    testOn(root).that.it.hasClasses('my.company');
  });

  it('can be unfolded again via clicking on them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass$SomeInnerClass');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
    await testGuiFromRoot(root).clickNodeAndAwait('my.company');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    testOn(root).that.it.hasClasses('my.company.SomeClass');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.SomeClass');
    testOn(root).that.it.hasClasses('my.company.SomeClass$SomeInnerClass');
  });

  it('notify only their fold-finished-listeners when clicking on them to fold or unfold them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
    const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold', 'onLayoutChanged');
    root.addListener(nodeListenerMock.listener);

    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.called.once();
    nodeListenerMock.test.that.listenerFunction('onFold').was.not.called();

    nodeListenerMock.reset();
    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.called.once();
    nodeListenerMock.test.that.listenerFunction('onFold').was.not.called();
  });

  it('trigger a single relayout when clicking on them to fold or unfold them', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
    const nodeListenerMock = createListenerMock('onFoldFinished', 'onLayoutChanged');
    root.addListener(nodeListenerMock.listener);

    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    nodeListenerMock.test.that.listenerFunction('onLayoutChanged').was.called.once();

    nodeListenerMock.reset();
    await testGuiFromRoot(root).clickNodeAndAwait('my.company');
    nodeListenerMock.test.that.listenerFunction('onLayoutChanged').was.called.once();
  });

  it('create a correct layout after folding a node and after unfolding it again', async () => {
    const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.first.SomeClass', 'my.company.first.OtherClass',
      'my.company.second.SomeClass', 'my.company.second.OtherClass');

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
    testWholeLayoutOn(root);

    await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
    testWholeLayoutOn(root);
  });

  describe("public methods", () => {
    describe('#isFolded()', () => {
      it('returns true after folding a node and returns false after unfolding again, when it is done via clicking', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isFolded()).to.be.true;

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isFolded()).to.be.false;
      });

      it('returns false after unfolding a node via #unfold()', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isFolded()).to.be.true;

        root.getByName('my.company').unfold();
        expect(root.getByName('my.company').isFolded()).to.be.false;
      });
    });

    describe('#isCurrentlyLeaf()', () => {
      it('returns true after folding and returns false after unfolding again, when it is done via clicking', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isCurrentlyLeaf()).to.be.true;

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isCurrentlyLeaf()).to.be.false;
      });

      it('returns false after unfolding a node via #unfold()', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').isCurrentlyLeaf()).to.be.true;

        root.getByName('my.company').unfold();
        expect(root.getByName('my.company').isCurrentlyLeaf()).to.be.false;
      });
    });

    describe('#unfold()', () => {
      it('does nothing on unfolded nodes', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        root.getByName('my.company').unfold();
        testOn(root).that.it.hasClasses('my.company.SomeClass');
      });

      it('does not notify the fold-finished-listener or the fold-listener on unfolded nodes', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
        const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold');
        root.addListener(nodeListenerMock.listener);

        root.getByName('my.company').unfold();

        nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
        nodeListenerMock.test.that.listenerFunction('onFold').was.not.called();
      });

      it('unfolds a folded node, if relayout is invoked after that', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
        await testGuiFromRoot(root).clickNodeAndAwait('my.company');

        root.getByName('my.company').unfold();
        root.relayoutCompletely();
        await root._updatePromise;
        testOn(root).that.it.hasClasses('my.company.SomeClass');
      });

      it('notifies only the fold-listener on folded nodes', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');
        const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold', 'onLayoutChanged');
        root.addListener(nodeListenerMock.listener);
        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        nodeListenerMock.reset();

        root.getByName('my.company').unfold();
        nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
        nodeListenerMock.test.that.listenerFunction('onFold').was.called.once();
      });
    });

    describe('#getCurrentChildren()', () => {
      it('returns the empty array on folded nodes and the children on unfolding again, when it is done via clicking', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').getCurrentChildren()).to.be.empty;

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').getCurrentChildren()).to.onlyContainNodes('my.company.SomeClass');
      });

      it('returns the children after unfolding a node via #unfold()', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass');

        await testGuiFromRoot(root).clickNodeAndAwait('my.company');
        expect(root.getByName('my.company').getCurrentChildren()).to.be.empty;

        root.getByName('my.company').unfold();
        expect(root.getByName('my.company').getCurrentChildren()).to.onlyContainNodes('my.company.SomeClass');
      });
    });
  });

  describe('some typical scenarios when folding inner nodes:', () => {
    it('fold nodes bottom up via clicking on them and unfold them again', async () => {
      const root = await rootCreator.createRootFromClassNamesAndLayout(
        'my.company.first.FirstClass$SomeInnerClass', 'my.company.first.FirstClass$OtherInnerClass',
        'my.company.first.SecondClass', 'my.company.first.ThirdClass',
        'my.company.second.SomeClass', 'my.otherCompany.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.FirstClass');
      testOn(root).that.it.hasClasses('my.company.first.FirstClass', 'my.company.first.SecondClass', 'my.company.first.ThirdClass',
        'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
      testOn(root).that.it.hasClasses('my.company.first', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company');
      testOn(root).that.it.hasClasses('my.company', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company');
      testOn(root).that.it.hasClasses('my.company.first', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
      testOn(root).that.it.hasClasses('my.company.first.FirstClass', 'my.company.first.SecondClass', 'my.company.first.ThirdClass',
        'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.FirstClass');
      testOn(root).that.it.hasClasses('my.company.first.FirstClass$SomeInnerClass', 'my.company.first.FirstClass$OtherInnerClass',
        'my.company.first.SecondClass', 'my.company.first.ThirdClass', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);
    });

    it('fold nodes with an unfolded non-leaf child-node and unfold them again', async () => {
      const root = await rootCreator.createRootFromClassNamesAndLayout(
        'my.company.first.somePkg.SomeClass$FirstInnerClass$SecondInnerClass', 'my.company.first.otherPkg.OtherClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.somePkg.SomeClass');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass', 'my.company.first.otherPkg.OtherClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
      testOn(root).that.it.hasClasses('my.company.first');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass', 'my.company.first.otherPkg.OtherClass');
      testWholeLayoutOn(root);

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.somePkg.SomeClass');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass$FirstInnerClass$SecondInnerClass',
        'my.company.first.otherPkg.OtherClass');
      testWholeLayoutOn(root);
    });

    it('fold nodes directly successively, so that the relayout of the folding before is not finished yet', async () => {
      const root = await rootCreator.createRootFromClassNamesAndLayout(
        'my.company.first.somePkg.FirstClass$SomeInnerClass', 'my.company.first.somePkg.FirstClass$OtherInnerClass',
        'my.company.first.SecondClass', 'my.company.first.ThirdClass',
        'my.company.second.SomeClass', 'my.otherCompany.SomeClass');

      testGuiFromRoot(root).clickNode('my.company.first.somePkg.FirstClass');
      testGuiFromRoot(root).clickNode('my.company.first.somePkg');
      testGuiFromRoot(root).clickNode('my.company.second');
      testGuiFromRoot(root).clickNode('my.company.first');
      await testGuiFromRoot(root).clickNodeAndAwait('my.company');
      testOn(root).that.it.hasClasses('my.company', 'my.otherCompany.SomeClass');
      testWholeLayoutOn(root);
    });
  });
});

describe('Root', () => {
  describe('#foldAllNodes()', () => {
    it('only shows the top level packages', () => {
      const root = rootCreator.createRootFromClassNames('my.company.first.somePkg.SomeClass$SomeInnerClass',
        'my.company.first.somePkg.OtherClass', 'my.company.first.otherPkg.SomeClass', 'my.company.second.SomeClass',
        'my.otherCompany.SomeClass', 'your.company.SomeClass');
      root.foldAllNodes();

      testOn(root).that.it.hasClasses('my', 'your.company');
    });

    it('not only folds the top level packages, but also all the inner nodes', async () => {
      const root = rootCreator.createRootFromClassNames('my.company.first.somePkg.SomeClass$SomeInnerClass',
        'my.company.first.somePkg.OtherClass', 'my.company.first.otherPkg.SomeClass', 'my.company.second.SomeClass',
        'my.otherCompany.SomeClass', 'your.company.SomeClass');
      root.foldAllNodes();
      root.relayoutCompletely();
      await root._updatePromise;

      await testGuiFromRoot(root).clickNodeAndAwait('my');
      testOn(root).that.it.hasClasses('my.company', 'my.otherCompany', 'your.company');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company');
      testOn(root).that.it.hasClasses('my.company.first', 'my.company.second', 'my.otherCompany', 'your.company');

      await testGuiFromRoot(root).clickNodeAndAwait('my.otherCompany');
      testOn(root).that.it.hasClasses('my.company.first', 'my.company.second', 'my.otherCompany.SomeClass', 'your.company');

      await testGuiFromRoot(root).clickNodeAndAwait('your.company');
      testOn(root).that.it.hasClasses('my.company.first', 'my.company.second', 'my.otherCompany.SomeClass',
        'your.company.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first');
      testOn(root).that.it.hasClasses('my.company.first.somePkg', 'my.company.first.otherPkg',
        'my.company.second', 'my.otherCompany.SomeClass', 'your.company.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.somePkg');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass', 'my.company.first.somePkg.OtherClass',
        'my.company.first.otherPkg', 'my.company.second', 'my.otherCompany.SomeClass', 'your.company.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.somePkg.SomeClass');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass$SomeInnerClass', 'my.company.first.somePkg.OtherClass',
        'my.company.first.otherPkg', 'my.company.second', 'my.otherCompany.SomeClass', 'your.company.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.first.otherPkg');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass$SomeInnerClass', 'my.company.first.somePkg.OtherClass',
        'my.company.first.otherPkg.SomeClass', 'my.company.second', 'my.otherCompany.SomeClass', 'your.company.SomeClass');

      await testGuiFromRoot(root).clickNodeAndAwait('my.company.second');
      testOn(root).that.it.hasClasses('my.company.first.somePkg.SomeClass$SomeInnerClass', 'my.company.first.somePkg.OtherClass',
        'my.company.first.otherPkg.SomeClass', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass', 'your.company.SomeClass');
    });

    it('a correct layout can be created after that', async () => {
      const root = rootCreator.createRootFromClassNames('my.company.first.somePkg.SomeClass$SomeInnerClass',
        'my.company.first.somePkg.OtherClass', 'my.company.first.otherPkg.SomeClass', 'my.company.second.SomeClass',
        'my.otherCompany.SomeClass', 'your.company.SomeClass');
      root.foldAllNodes();
      root.relayoutCompletely();
      await root._updatePromise;

      testWholeLayoutOn(root);
    });

    it('notifies only the fold-listener for every folded node', () => {
      const root = rootCreator.createRootFromClassNames('my.company.first.SomeClass$SomeInnerClass',
        'my.company.first.OtherClass', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass', 'your.company.SomeClass');
      const nodeListenerMock = createListenerMock('onFoldFinished', 'onFold');
      root.addListener(nodeListenerMock.listener);
      root.foldAllNodes();

      nodeListenerMock.test.that.listenerFunction('onFold').was.called.with.nodes(
        'my.company.first.SomeClass', 'my.company.first', 'my.company', 'my', 'my.company.second', 'my.otherCompany', 'your.company'
      );
      nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
    });

    it('makes #isFolded() return true for the folded nodes', async () => {
      const root = rootCreator.createRootFromClassNames('my.company.first.SomeClass$SomeInnerClass', 'my.company.first.OtherClass',
        'my.company.second.SomeClass', 'my.otherCompany.SomeClass', 'your.company.SomeClass');
      root.foldAllNodes();

      expect(root.getByName('my').isFolded()).to.be.true;
      expect(root.getByName('my.company').isFolded()).to.be.true;
      expect(root.getByName('my.company.first').isFolded()).to.be.true;
      expect(root.getByName('my.company.first.SomeClass').isFolded()).to.be.true;
      expect(root.getByName('my.company.second').isFolded()).to.be.true;
      expect(root.getByName('my.otherCompany').isFolded()).to.be.true;
      expect(root.getByName('your.company').isFolded()).to.be.true;
    });
  });

  describe('#foldNodesWithMinimumDepthThatHaveNotDescendants', () => {
    const foldNodesWithMinimumDepthThatHaveNotDescendantFullNames = (root, descendantFullNames) => {
      const nodes = descendantFullNames.map(nodeFullName => root.getByName(nodeFullName));
      root.foldNodesWithMinimumDepthThatHaveNotDescendants(new Set(nodes));
    };

    it('notifies only the on-fold-listener of the folded nodes', async () => {
      const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass', 'my.otherCompany.SomeClass',
        'my.otherCompany.OtherClass');
      const nodeListenerMock = createListenerMock('onFold', 'onFoldFinished');
      root.addListener(nodeListenerMock.listener);
      foldNodesWithMinimumDepthThatHaveNotDescendantFullNames(root, ['my.otherCompany.SomeClass', 'my.otherCompany.OtherClass']);

      nodeListenerMock.test.that.listenerFunction('onFold').was.called.with.nodes('my.company');
      nodeListenerMock.test.that.listenerFunction('onFoldFinished').was.not.called();
    });

    it('makes #isFolded() return true for the folded nodes', async () => {
      const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.SomeClass', 'my.otherCompany.SomeClass',
        'my.otherCompany.OtherClass');
      foldNodesWithMinimumDepthThatHaveNotDescendantFullNames(root, ['my.otherCompany.SomeClass', 'my.otherCompany.OtherClass']);
      expect(root.getByName('my.company').isFolded()).to.be.true;
    });

    describe('some typical cases of initial node structures and given descendant classes', () => {
      it('does not fold any node, if the given set of descendant classes is empty', async () => {
        const root = await rootCreator.createRootFromClassNamesAndLayout('my.company.first.SomeClass$SomeInnerClass',
          'my.company.first.OtherClass', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
        root.foldNodesWithMinimumDepthThatHaveNotDescendants(new Set());
        testOn(root).that.it.hasClasses('my.company.first.SomeClass$SomeInnerClass',
          'my.company.first.OtherClass', 'my.company.second.SomeClass', 'my.otherCompany.SomeClass');
      });

      describe('the path of the given classes does not contain a node to fold, but top level packages have to be folded:', () => {
        let root;
        beforeEach(async () => {
          root = await rootCreator.createRootFromClassNamesAndLayout('first.company.first.SomeClass', 'first.company.second.SomeClass',
            'second.company.SomeClass', 'third.company.first.SomeClass', 'third.company.second.OtherClass');
          const nodeFullNames = ['third.company.first.SomeClass', 'third.company.second.OtherClass'];
          foldNodesWithMinimumDepthThatHaveNotDescendantFullNames(root, nodeFullNames);
        });

        it('only the top level packages and the given descendant classes are shown', () => {
          testOn(root).that.it.hasClasses('first.company', 'second.company',
            'third.company.first.SomeClass', 'third.company.second.OtherClass');
        });

        it('the descendants of the top level packages are not folded', async () => {
          root.relayoutCompletely();
          await root._updatePromise;

          await testGuiFromRoot(root).clickNodeAndAwait('first.company');
          testOn(root).that.it.hasClasses('first.company.first.SomeClass', 'first.company.second.SomeClass', 'second.company',
            'third.company.first.SomeClass', 'third.company.second.OtherClass');

          await testGuiFromRoot(root).clickNodeAndAwait('second.company');
          testOn(root).that.it.hasClasses('first.company.first.SomeClass', 'first.company.second.SomeClass',
            'second.company.SomeClass', 'third.company.first.SomeClass', 'third.company.second.OtherClass');
        });
      });

      describe('the path of the given classes contains nodes to fold:', () => {
        let root;
        beforeEach(async () => {
          root = await rootCreator.createRootFromClassNamesAndLayout(
            'your.company.first.somePkg.SomeClass', 'your.company.first.otherPkg.SomeClass', 'your.company.first.otherPkg.OtherClass',
            'your.company.first.somePkg.OtherClass$SomeInnerClass$SomeMoreInnerClass', 'your.company.first.thirdPkg.somePkg.SomeClass',
            'your.company.second.somePkg.SomeClass', 'your.otherCompany.SomeClass'
          );
          const nodeFullNames = ['your.company.first.somePkg.SomeClass', 'your.company.first.otherPkg.SomeClass',
            'your.company.first.otherPkg.OtherClass'];
          foldNodesWithMinimumDepthThatHaveNotDescendantFullNames(root, nodeFullNames);
        });

        it('all nodes with minimum depth, that have no of the given descendant classes as descendant, are folded', () => {
          testOn(root).that.it.hasClasses('your.company.first.somePkg.SomeClass', 'your.company.first.otherPkg.SomeClass',
            'your.company.first.otherPkg.OtherClass',
            'your.company.first.somePkg.OtherClass', 'your.company.first.thirdPkg',
            'your.company.second', 'your.otherCompany');
        });

        it('the descendants of folded nodes are not folded', async () => {
          root.relayoutCompletely();
          await root._updatePromise;

          await testGuiFromRoot(root).clickNodeAndAwait('your.company.first.somePkg.OtherClass');
          testOn(root).that.it.hasClasses('your.company.first.somePkg.SomeClass', 'your.company.first.otherPkg.SomeClass',
            'your.company.first.otherPkg.OtherClass',
            'your.company.first.somePkg.OtherClass$SomeInnerClass$SomeMoreInnerClass', 'your.company.first.thirdPkg',
            'your.company.second', 'your.otherCompany');

          await testGuiFromRoot(root).clickNodeAndAwait('your.company.first.thirdPkg');
          testOn(root).that.it.hasClasses('your.company.first.somePkg.SomeClass', 'your.company.first.otherPkg.SomeClass',
            'your.company.first.otherPkg.OtherClass',
            'your.company.first.somePkg.OtherClass$SomeInnerClass$SomeMoreInnerClass', 'your.company.first.thirdPkg.somePkg.SomeClass',
            'your.company.second', 'your.otherCompany');

        });
      });

      describe('the given descendant classes have children:', () => {
        let root;
        beforeEach(async () => {
          root = await rootCreator.createRootFromClassNamesAndLayout('first.company.SomeClass$SomeInnerClass$AnotherInnerClass',
            'first.company.OtherClass$SomeInnerClass');
          const nodeFullNames = ['first.company.SomeClass', 'first.company.OtherClass', 'first.company.OtherClass$SomeInnerClass'];
          foldNodesWithMinimumDepthThatHaveNotDescendantFullNames(root, nodeFullNames);
        });

        it('the children of the given descendant classes are folded out, unless the are in the given set themselves', () => {
          testOn(root).that.it.hasClasses('first.company.SomeClass', 'first.company.OtherClass$SomeInnerClass');
        });

        it('the inner nodes are not folded', async () => {
          root.relayoutCompletely();
          await root._updatePromise;

          await testGuiFromRoot(root).clickNodeAndAwait('first.company.SomeClass');
          testOn(root).that.it.hasClasses('first.company.SomeClass$SomeInnerClass$AnotherInnerClass',
            'first.company.OtherClass$SomeInnerClass');
        });
      });
    });
  });
});
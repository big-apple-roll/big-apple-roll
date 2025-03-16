import path from "node:path";

import { GatsbyNode, Node } from "gatsby";
import { createFilePath } from "gatsby-source-filesystem";
import FilterWarningsPlugin from "webpack-filter-warnings-plugin";

import { ScheduleDayTemplateContext } from "src/templates/scheduleDayTemplate";
import { ScheduleEventTemplateContext } from "src/templates/scheduleEventTemplate";
import { ShopProductTemplateContext } from "src/templates/shopProductTemplate";

export const createPages: GatsbyNode["createPages"] = async (args) => {
  const { actions, graphql, reporter } = args;
  const { createPage } = actions;

  const result = await graphql<Queries.CreatePagesQuery>(`
    query CreatePages {
      scheduleDays: allMarkdownRemark(
        filter: { fileRelativeDirectory: { eq: "schedule" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        edges {
          node {
            id
            slug
          }
          previous {
            id
          }
          next {
            id
          }
        }
      }
      scheduleEvents: allMarkdownRemark(
        filter: { fileRelativeDirectory: { regex: "/^schedule/.*/" } }
        sort: { frontmatter: { date: ASC } }
      ) {
        edges {
          node {
            id
            slug
          }
          previous {
            id
          }
          next {
            id
          }
        }
      }
      shopProducts: allMarkdownRemark(filter: { fileRelativeDirectory: { eq: "shop" } }) {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `);

  if (result.errors || !result.data) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  // Schedule day templates
  result.data.scheduleDays.edges.forEach(({ node, previous, next }) => {
    if (!node.slug) {
      return;
    }
    const context: ScheduleDayTemplateContext = {
      scheduleDayId: node.id,
      previousScheduleDayId: previous?.id,
      nextScheduleDayId: next?.id,
      scheduleEventsSlugRegex: `/^${node.slug}.+/`,
    };
    createPage({
      component: path.resolve(`./src/templates/scheduleDayTemplate.tsx`),
      path: node.slug,
      context,
    });
  });

  // Schedule event templates
  result.data.scheduleEvents.edges.forEach(({ node, previous, next }) => {
    if (!node.slug) {
      return;
    }
    const context: ScheduleEventTemplateContext = {
      scheduleEventId: node.id,
      previousScheduleEventId: previous?.id,
      nextScheduleEventId: next?.id,
    };
    createPage({
      component: path.resolve(`./src/templates/scheduleEventTemplate.tsx`),
      path: node.slug,
      context,
    });
  });

  // Shop product templates
  result.data.shopProducts.edges.forEach(({ node }) => {
    if (!node.slug) {
      return;
    }
    const context: ShopProductTemplateContext = {
      shopProductId: node.id,
    };
    createPage({
      component: path.resolve(`./src/templates/shopProductTemplate.tsx`),
      path: node.slug,
      context,
    });
  });
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type MarkdownRemark implements Node {
      slug: String! @proxy(from: "fields.slug")
      fileName: String! @proxy(from: "fields.fileName")
      fileRelativeDirectory: String! @proxy(from: "fields.fileRelativeDirectory")
      linkedFiles: [File!]!
    }
  `);
};

export const onCreateNode: GatsbyNode["onCreateNode"] = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  // Add file information on MarkdownRemark nodes
  if (node.internal.type === "MarkdownRemark") {
    // Create slug field on markdown nodes
    const slug = createFilePath({ node, getNode });
    createNodeField({
      node,
      name: "slug",
      value: slug,
    });

    // Create file fields on markdown nodes
    if (node.parent) {
      const parentNode = getNode(node.parent);
      if (parentNode) {
        const fileName = parentNode.name;
        createNodeField({
          node,
          name: "fileName",
          value: fileName,
        });

        const fileRelativeDirectory = parentNode.relativeDirectory;
        createNodeField({
          node,
          name: "fileRelativeDirectory",
          value: fileRelativeDirectory,
        });
      }
    }
  }
};

interface FileNode extends Node {
  extension: string;
  name: string;
  relativeDirectory: string;
}

interface MarkdownRemarkNode extends Node {
  fields: {
    slug: string;
    fileName: string;
    fileRelativeDirectory: string;
  };
}

interface ResolverContext {
  nodeModel: {
    findAll: <N extends Node>(options?: {
      type: string;
    }) => Promise<{
      entries: Iterable<N>;
    }>;
  };
}

export const createResolvers: GatsbyNode["createResolvers"] = ({ createResolvers }) => {
  createResolvers({
    MarkdownRemark: {
      linkedFiles: {
        type: "[File!]!",
        resolve: async (source: MarkdownRemarkNode, args: object, context: ResolverContext) => {
          const allFileNodes = (await context.nodeModel.findAll<FileNode>({ type: `File` }))
            .entries;

          const linkedFileNodes: Array<FileNode> = [];
          for (const fileNode of allFileNodes) {
            if (
              fileNode.relativeDirectory === source.fields.fileRelativeDirectory &&
              fileNode.name.startsWith(source.fields.fileName) &&
              fileNode.id !== source.parent
            ) {
              linkedFileNodes.push(fileNode);
            }
          }

          return linkedFileNodes;
        },
      },
    },
  });
};

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order. Following module has been added:/,
      }),
    ],
  });
};
